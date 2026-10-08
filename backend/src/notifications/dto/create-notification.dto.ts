import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsEnum(NotificationType) type!: NotificationType;
  @IsString() @MaxLength(180) title!: string;
  @IsString() @MaxLength(2000) body!: string;
  @IsOptional() @IsObject() data?: Record<string, unknown>;
}
