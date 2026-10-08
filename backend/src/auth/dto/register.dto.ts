import { RoleCode } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^(?:\+229\s*)?01(?:[\s-]?\d){8}$/, { message: 'Le numéro doit contenir 10 chiffres et commencer par 01.' })
  phone!: string;

  @IsString()
  @Length(8, 128)
  password!: string;

  @IsEnum(RoleCode)
  role!: RoleCode;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  activity?: string;

  @IsOptional()
  @IsString()
  skills?: string;
}
