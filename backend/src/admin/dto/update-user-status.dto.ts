import { AccountStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserStatusDto {
  @IsEnum(AccountStatus) status!: AccountStatus;
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
