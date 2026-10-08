import { UnauthorizedException } from '@nestjs/common';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { createHmac } from 'node:crypto';
import { PaymentsService } from './payments.service';

describe('PaymentsService phase 9', () => {
  it('rejects an invoice while the payment is not confirmed', async () => {
    const prisma = { invoice: { findFirst: jest.fn().mockResolvedValue({ status: PaymentStatus.PENDING, payment: { status: PaymentStatus.PENDING } }) } };
    const service = new PaymentsService(prisma as never, {} as never, {} as never, {} as never);
    await expect(service.invoice('user-1', 'invoice-1')).rejects.toThrow('confirmation du paiement');
  });

  it('returns the same payment for a repeated idempotency key', async () => {
    const existing = { id: 'payment-1', userId: 'user-1', reference: 'AGR-1' };
    const prisma = { payment: { findUnique: jest.fn().mockResolvedValue(existing), updateMany: jest.fn().mockResolvedValue({ count: 0 }) } };
    const service = new PaymentsService(prisma as never, {} as never, {} as never, {} as never);

    const result = await service.initialize('user-1', { amountXof: 5000, provider: PaymentProvider.MTN_MOMO }, 'same-key');

    expect(result).toBe(existing);
    expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { idempotencyKey: 'same-key' } });
  });

  it('rejects a webhook with an invalid HMAC signature', async () => {
    const config = { get: jest.fn().mockImplementation((key: string) => key === 'PAYMENT_WEBHOOK_SECRET' ? 'secret' : undefined) };
    const service = new PaymentsService({} as never, {} as never, config as never, {} as never);

    await expect(service.handleWebhook(PaymentProvider.MTN_MOMO, { eventId: 'event-1', reference: 'AGR-1', status: PaymentStatus.SUCCESS }, 'invalid', '{"eventId":"event-1"}')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('processes a signed success webhook once and creates an invoice', async () => {
    const payload = '{"eventId":"event-1","reference":"AGR-1","status":"SUCCESS"}';
    const signature = createHmac('sha256', 'secret').update(payload).digest('hex');
    const payment = { id: 'payment-1', userId: 'user-1', requestId: null, reference: 'AGR-1', externalReference: null, amountXof: 5000, status: PaymentStatus.PENDING };
    const event = { id: 'event-db-1' };
    const transaction = {
      paymentWebhookEvent: { create: jest.fn().mockResolvedValue(event), update: jest.fn() },
      payment: { update: jest.fn().mockResolvedValue({ ...payment, status: PaymentStatus.SUCCESS }) },
      invoice: { upsert: jest.fn().mockResolvedValue({ invoiceNumber: 'FAC-1' }) },
    };
    const prisma = { payment: { findFirst: jest.fn().mockResolvedValue(payment) }, $transaction: jest.fn().mockImplementation(async callback => callback(transaction)) };
    const notifications = { create: jest.fn().mockResolvedValue({ id: 'notification-1' }) };
    const config = { get: jest.fn().mockImplementation((key: string) => key === 'PAYMENT_WEBHOOK_SECRET' ? 'secret' : undefined) };
    const service = new PaymentsService(prisma as never, {} as never, config as never, notifications as never);

    const result = await service.handleWebhook(PaymentProvider.MTN_MOMO, { eventId: 'event-1', reference: 'AGR-1', status: PaymentStatus.SUCCESS }, signature, payload);

    expect(result).toMatchObject({ duplicate: false, matched: true });
    expect(transaction.invoice.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { paymentId: 'payment-1' } }));
    expect(notifications.create).toHaveBeenCalledWith('user-1', expect.objectContaining({ type: 'PAYMENT_CONFIRMED' }));
  });
});
