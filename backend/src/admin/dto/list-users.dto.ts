import { AccountStatus, RoleCode } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListUsersDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsEnum(RoleCode) role?: RoleCode;
  @IsOptional() @IsEnum(AccountStatus) status?: AccountStatus;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 25;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip = 0;
}
