import { IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @Matches(/^(?:\+229\s*)?01(?:[\s-]?\d){8}$/)
  phone!: string;
  @IsString() @Length(6, 6) code!: string;
  @IsString() @Length(8, 128) newPassword!: string;
}
