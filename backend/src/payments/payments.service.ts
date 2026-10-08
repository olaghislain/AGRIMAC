import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Invoice, PaymentProvider, PaymentStatus, Prisma } from '@prisma/client';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';
import { PaymentProviderService } from './payment-provider.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService, private readonly providers: PaymentProviderService, private readonly config: ConfigService, private readonly notifications: NotificationsService) {}

  async initialize(userId: string, dto: InitializePaymentDto, idempotencyKey?: string) {
    await this.expirePendingPayments();
    if (dto.requestId && !await this.prisma.repairRequest.findFirst({ where: { id: dto.requestId, requesterId: userId } })) throw new NotFoundException('Demande associée introuvable.');
    const key = idempotencyKey?.trim() || null;
    if (key) {
      const existing = await this.prisma.payment.findUnique({ where: { idempotencyKey: key } });
      if (existing) { if (existing.userId !== userId) throw new ConflictException('Cette clé d’idempotence appartient à un autre utilisateur.'); return existing; }
    }
    const reference = `AGR-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
    const created = await this.prisma.payment.create({ data: { userId, requestId: dto.requestId, reference, idempotencyKey: key, provider: dto.provider, amountXof: dto.amountXof, status: PaymentStatus.PENDING, expiresAt: new Date(Date.now() + this.config.get<number>('PAYMENT_EXPIRY_MINUTES', 30) * 60 * 1000) } });
    try {
      const providerResult = await this.providers.initialize(dto.provider, { reference, amountXof: dto.amountXof });
      return this.prisma.payment.update({ where: { id: created.id }, data: { externalReference: providerResult.externalReference, status: providerResult.status, metadata: { integration: providerResult.integration } } });
    } catch (error) {
      await this.prisma.payment.update({ where: { id: created.id }, data: { status: PaymentStatus.FAILED, failureReason: error instanceof Error ? error.message : 'Fournisseur indisponible.' } });
      throw error;
    }
  }

  async list(userId: string) { await this.expirePendingPayments(); return this.prisma.payment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, include: { invoice: true, request: { select: { id: true, title: true } } } }); }

  async get(userId: string, id: string) { const payment = await this.prisma.payment.findFirst({ where: { id, userId }, include: { invoice: true, request: true, webhookEvents: { orderBy: { createdAt: 'desc' }, take: 10 } } }); if (!payment) throw new NotFoundException('Transaction introuvable.'); return payment; }

  async handleWebhook(provider: PaymentProvider, dto: WebhookPaymentDto, signature: string | undefined, rawPayload: string) {
    this.verifySignature(provider, signature, rawPayload);
    if (dto.amountXof !== undefined && dto.reference) {
      const expectedPayment = await this.prisma.payment.findUnique({ where: { reference: dto.reference }, select: { amountXof: true } });
      if (expectedPayment && expectedPayment.amountXof !== dto.amountXof) throw new BadRequestException('Le montant du webhook ne correspond pas à la transaction.');
    }
    const payment = await this.prisma.payment.findFirst({ where: { OR: [{ reference: dto.reference || undefined }, { externalReference: dto.externalReference || undefined }].filter(item => Object.values(item)[0]) as Prisma.PaymentWhereInput['OR'] } });
    try {
      const result = await this.prisma.$transaction(async transaction => {
        const event = await transaction.paymentWebhookEvent.create({ data: { provider, eventId: dto.eventId, paymentId: payment?.id, payload: dto as unknown as Prisma.InputJsonValue, signatureValid: true } });
        if (!payment) { await transaction.paymentWebhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } }); return { duplicate: false, matched: false, eventId: event.id }; }
        const next = this.normalizeWebhookStatus(dto.status);
        if (payment.status === PaymentStatus.SUCCESS && next !== PaymentStatus.SUCCESS) return { duplicate: false, matched: true, ignored: true, payment };
        const updated = await transaction.payment.update({ where: { id: payment.id }, data: { status: next, externalReference: dto.externalReference || payment.externalReference, failureReason: next === PaymentStatus.FAILED ? dto.failureReason || 'Paiement échoué.' : null } });
        if (next === PaymentStatus.SUCCESS) await transaction.invoice.upsert({ where: { paymentId: payment.id }, update: { status: PaymentStatus.SUCCESS, transactionReference: dto.externalReference || payment.externalReference || payment.reference }, create: { paymentId: payment.id, userId: payment.userId, requestId: payment.requestId, invoiceNumber: `FAC-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`, transactionReference: dto.externalReference || payment.externalReference || payment.reference, provider, description: 'Paiement AGRIMAC confirmé', amountXof: dto.amountXof || payment.amountXof, currency: 'XOF', status: PaymentStatus.SUCCESS } });
        await transaction.paymentWebhookEvent.update({ where: { id: event.id }, data: { processedAt: new Date() } });
        return { duplicate: false, matched: true, payment: updated };
      });
      if (!result.duplicate && result.matched && 'payment' in result && result.payment) await this.notifyPayment(result.payment.userId, result.payment.id, result.payment.status);
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { duplicate: true, provider, eventId: dto.eventId };
      throw error;
    }
  }

  async invoices(userId: string) { return this.prisma.invoice.findMany({ where: { userId }, orderBy: { issuedAt: 'desc' }, include: { payment: true, request: { select: { id: true, title: true } } } }); }
  async invoice(userId: string, id: string) { const invoice = await this.prisma.invoice.findFirst({ where: { id, userId }, include: { payment: true, request: true, user: { include: { farmerProfile: true, companyProfile: true, technicianProfile: true } } } }); if (!invoice) throw new NotFoundException('Facture introuvable.'); if (invoice.status !== PaymentStatus.SUCCESS || invoice.payment.status !== PaymentStatus.SUCCESS) throw new BadRequestException('La facture n’est disponible qu’après confirmation du paiement.'); return invoice; }

  private async notifyPayment(userId: string, paymentId: string, status: PaymentStatus) { await this.notifications.create(userId, { type: status === PaymentStatus.SUCCESS ? 'PAYMENT_CONFIRMED' : 'PAYMENT_FAILED', title: status === PaymentStatus.SUCCESS ? 'Paiement confirmé' : 'Paiement échoué', body: status === PaymentStatus.SUCCESS ? 'Votre paiement a été confirmé et votre facture est disponible.' : 'Votre paiement n’a pas pu être confirmé.', data: { paymentId } }); }
  private expirePendingPayments() { return this.prisma.payment.updateMany({ where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] }, expiresAt: { lt: new Date() } }, data: { status: PaymentStatus.EXPIRED, failureReason: 'Délai de paiement dépassé.' } }); }
  private normalizeWebhookStatus(status: PaymentStatus) { if (status === PaymentStatus.SUCCESS) return PaymentStatus.SUCCESS; if (status === PaymentStatus.FAILED) return PaymentStatus.FAILED; if (status === PaymentStatus.CANCELLED) return PaymentStatus.CANCELLED; if (status === PaymentStatus.EXPIRED) return PaymentStatus.EXPIRED; return PaymentStatus.PROCESSING; }
  private verifySignature(provider: PaymentProvider, signature: string | undefined, payload: string) { const secret = this.config.get<string>(`PAYMENT_${provider}_WEBHOOK_SECRET`) || this.config.get<string>('PAYMENT_WEBHOOK_SECRET'); if (!secret) throw new UnauthorizedException('Secret webhook non configuré.'); if (!signature) throw new UnauthorizedException('Signature webhook manquante.'); const expected = createHmac('sha256', secret).update(payload).digest('hex'); const left = Buffer.from(expected); const right = Buffer.from(signature.replace(/^sha256=/, '')); if (left.length !== right.length || !timingSafeEqual(left, right)) throw new UnauthorizedException('Signature webhook invalide.'); }
}
