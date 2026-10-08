import { ModerationStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ResolveReportDto {
  @IsEnum(ModerationStatus) status!: ModerationStatus;
  @IsOptional() @IsString() @MaxLength(1000) resolutionNote?: string;
}
