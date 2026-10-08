import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class RespondQuoteDto {
  @IsUUID()
  requestId!: string;
  @IsInt()
  @Min(1)
  amountXof!: number;
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
