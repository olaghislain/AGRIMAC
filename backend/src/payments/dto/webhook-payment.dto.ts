import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaymentStatus } from '@prisma/client';

export class WebhookPaymentDto {
  @IsString() eventId!: string;
  @IsOptional() @IsString() reference?: string;
  @IsOptional() @IsString() externalReference?: string;
  @IsEnum(PaymentStatus) status!: PaymentStatus;
  @IsOptional() @IsInt() @Min(0) amountXof?: number;
  @IsOptional() @IsString() failureReason?: string;
}
