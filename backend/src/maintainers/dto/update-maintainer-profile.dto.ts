import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMaintainerProfileDto {
  @IsOptional() @IsString() @MaxLength(180) displayName?: string;
  @IsOptional() @IsString() skills?: string;
  @IsOptional() @IsString() @MaxLength(120) city?: string;
  @IsOptional() @IsString() @MaxLength(120) region?: string;
}
