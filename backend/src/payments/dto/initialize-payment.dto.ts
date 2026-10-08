import { PaymentProvider } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsInt()
  @Min(1)
  amountXof!: number;

  @IsEnum(PaymentProvider)
  provider!: PaymentProvider;

  @IsOptional()
  @IsUUID()
  requestId?: string;
}
