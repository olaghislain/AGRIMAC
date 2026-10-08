import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentProvider } from '@prisma/client';
import { randomUUID } from 'node:crypto';

export interface ProviderInitialization {
  externalReference: string | null;
  status: 'PENDING' | 'PROCESSING';
  integration: 'configured' | 'provider_not_configured';
}

@Injectable()
export class PaymentProviderService {
  constructor(private readonly config: ConfigService) {}

  async initialize(provider: PaymentProvider, input: { reference: string; amountXof: number; phone?: string }) : Promise<ProviderInitialization> {
    const endpoint = this.config.get<string>(`PAYMENT_${provider}_INIT_URL`);
    if (!endpoint) return { externalReference: null, status: 'PENDING', integration: 'provider_not_configured' };
    const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${this.config.get<string>(`PAYMENT_${provider}_API_KEY`, '')}` }, body: JSON.stringify({ reference: input.reference, amount: input.amountXof, currency: 'XOF', phone: input.phone }) });
    if (!response.ok) throw new Error(`Le fournisseur ${provider} a refusé la demande.`);
    const payload = await response.json() as { externalReference?: string };
    return { externalReference: payload.externalReference || randomUUID(), status: 'PROCESSING', integration: 'configured' };
  }
}
