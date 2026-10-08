import { RequestKind } from '@prisma/client';
import { IsEnum, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRequestDto {
  @IsEnum(RequestKind)
  kind!: RequestKind;

  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetXof?: number;
}
