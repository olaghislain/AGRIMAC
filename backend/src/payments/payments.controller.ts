import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaymentProvider, RoleCode } from '@prisma/client';
import type { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { AuthenticatedRequestUser } from '../common/auth/auth.types';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentsService } from './payments.service';
import { WebhookPaymentDto } from './dto/webhook-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleCode.AGRICULTEUR)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get() @ApiOperation({ summary: 'List payments for the authenticated farmer' }) list(@CurrentUser() user: AuthenticatedRequestUser) { return this.payments.list(user.userId); }
  @Post('initialize') @ApiOperation({ summary: 'Initialize an idempotent provider payment' }) initialize(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: InitializePaymentDto, @Headers('idempotency-key') idempotencyKey?: string) { return this.payments.initialize(user.userId, dto, idempotencyKey); }
  @Get('invoices/list') @ApiOperation({ summary: 'List owned payment invoices' }) invoices(@CurrentUser() user: AuthenticatedRequestUser) { return this.payments.invoices(user.userId); }
  @Get('invoices/:id/pdf') @ApiOperation({ summary: 'Generate a PDF receipt for an owned invoice' }) async invoicePdf(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string, @Res() response: Response) { const invoice = await this.payments.invoice(user.userId, id); const document = new PDFDocument({ size: 'A4', margin: 52 }); response.setHeader('Content-Type', 'application/pdf'); response.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`); document.pipe(response); document.fillColor('#106e3f').fontSize(24).text('AGRIMAC'); document.fillColor('#354339').fontSize(10).text('Écosystème agricole du Bénin'); document.moveDown(2); document.fontSize(20).text('FACTURE / REÇU DE PAIEMENT'); document.moveDown(); document.fontSize(11).text(`Numéro : ${invoice.invoiceNumber}`).text(`Date : ${invoice.issuedAt.toISOString()}`).text(`Référence transaction : ${invoice.transactionReference}`).text(`Moyen : ${invoice.provider}`).moveDown(); document.fontSize(13).text(invoice.description).moveDown(); document.fontSize(18).fillColor('#106e3f').text(`${invoice.amountXof.toLocaleString('fr-FR')} ${invoice.currency}`); document.fillColor('#354339').fontSize(10).moveDown(2).text('Statut : Paiement confirmé'); document.end(); }
  @Get('invoices/:id') @ApiOperation({ summary: 'Get one owned invoice' }) invoice(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.payments.invoice(user.userId, id); }
  @Get(':id') @ApiOperation({ summary: 'Get one owned payment with webhook history' }) get(@CurrentUser() user: AuthenticatedRequestUser, @Param('id', ParseUUIDPipe) id: string) { return this.payments.get(user.userId, id); }
}

@ApiTags('payment-webhooks')
@Controller('payments/webhooks')
export class PaymentWebhookController {
  constructor(private readonly payments: PaymentsService) {}

  @Post(':provider')
  @ApiOperation({ summary: 'Receive a signed idempotent payment provider webhook' })
  @ApiParam({ name: 'provider', enum: PaymentProvider })
  @ApiBody({ type: WebhookPaymentDto })
  webhook(@Param('provider') provider: PaymentProvider, @Body() dto: WebhookPaymentDto, @Headers('x-signature') signature: string | undefined, @Req() request: Request & { rawBody?: Buffer }) { if (!Object.values(PaymentProvider).includes(provider)) throw new Error('Fournisseur de paiement invalide.'); return this.payments.handleWebhook(provider, dto, signature, request.rawBody?.toString('utf8') || JSON.stringify(dto)); }
}
