import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ValidateSourceDto {
  @IsBoolean() approved!: boolean;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
}
