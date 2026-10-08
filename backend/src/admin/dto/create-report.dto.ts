import { ModerationTargetType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsEnum(ModerationTargetType) targetType!: ModerationTargetType;
  @IsUUID() targetId!: string;
  @IsString() @MaxLength(500) reason!: string;
}
