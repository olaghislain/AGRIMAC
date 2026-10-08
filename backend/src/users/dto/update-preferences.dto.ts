import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional() @IsString() @IsIn(['Français', 'Fon', 'English']) language?: string;
  @IsOptional() @IsString() @IsIn(['Simplifié', 'Avancé']) displayMode?: string;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() profilePublic?: boolean;
  @IsOptional() @IsBoolean() urgentEnabled?: boolean;
}
