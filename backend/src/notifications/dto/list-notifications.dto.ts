import { Type } from 'class-transformer';
import { IsBooleanString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class ListNotificationsDto {
  @IsOptional() @IsBooleanString() unreadOnly?: string;
  @IsOptional() @IsEnum(NotificationType) type?: NotificationType;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip = 0;
}
