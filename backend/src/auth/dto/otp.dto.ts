import { OtpPurpose } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^(?:\+229\s*)?01(?:[\s-]?\d){8}$/, { message: 'Le numéro doit contenir 10 chiffres et commencer par 01.' })
  phone!: string;

  @IsOptional()
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose;
}

export class VerifyOtpDto {
  @IsString()
  @Matches(/^(?:\+229\s*)?01(?:[\s-]?\d){8}$/, { message: 'Le numéro doit contenir 10 chiffres et commencer par 01.' })
  phone!: string;

  @IsString()
  @Length(6, 6)
  code!: string;

  @IsOptional()
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose;
}
