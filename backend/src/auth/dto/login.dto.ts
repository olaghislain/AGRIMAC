import { RoleCode } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^(?:\+229\s*)?01(?:[\s-]?\d){8}$/, { message: 'Le numéro doit contenir 10 chiffres et commencer par 01.' })
  phone!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  @IsOptional()
  @IsEnum(RoleCode)
  role?: RoleCode;
}
