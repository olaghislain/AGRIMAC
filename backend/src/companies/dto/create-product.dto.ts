import { ListingStatus, ProductKind } from '@prisma/client';
import { IsEnum, IsInt, IsLatitude, IsLongitude, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() @MaxLength(180) title!: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsEnum(ProductKind) kind!: ProductKind;
  @IsOptional() @IsEnum(ListingStatus) status?: ListingStatus;
  @IsOptional() @IsInt() @Min(0) priceXof?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsString() @MaxLength(120) city?: string;
  @IsOptional() @IsString() @MaxLength(120) region?: string;
  @IsOptional() @IsLatitude() latitude?: number;
  @IsOptional() @IsLongitude() longitude?: number;
  @IsOptional() @IsString() @MaxLength(500) imageUrl?: string;
}
