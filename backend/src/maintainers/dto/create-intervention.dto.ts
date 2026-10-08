import { IsDateString, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateInterventionDto {
  @IsString() @MaxLength(180) title!: string;
  @IsOptional() @IsString() @MaxLength(3000) description?: string;
  @IsOptional() @IsString() @MaxLength(240) location?: string;
  @IsDateString() scheduledAt!: string;
  @IsOptional() @IsInt() @Min(0) amountXof?: number;
  @IsOptional() @IsUUID() requestId?: string;
  @IsOptional() @IsUUID() quoteId?: string;
}
