import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ScrapedAuthorizationStatus, ScrapedImageReuseStatus } from '@prisma/client';

export class AuthorizationSourceDto {
  @IsEnum(ScrapedAuthorizationStatus) status!: ScrapedAuthorizationStatus;
  @IsOptional() @IsDateString() authorizationGrantedAt?: string;
  @IsOptional() @IsString() @MaxLength(500) authorizationProofRef?: string;
  @IsOptional() @IsBoolean() dataExtractionAuthorized = false;
  @IsOptional() @IsBoolean() listingReuseAuthorized = false;
  @IsOptional() @IsEnum(ScrapedImageReuseStatus) imageReuseStatus = ScrapedImageReuseStatus.UNCLARIFIED;
  @IsOptional() @IsBoolean() reuseImages = false;
  @IsOptional() @IsInt() @Min(1) maxFrequencySeconds?: number;
  @IsOptional() @IsInt() @Min(1) maxRequests?: number;
  @IsOptional() @IsString() attributionRules?: string;
  @IsOptional() @IsString() deletionPolicy?: string;
  @IsOptional() @IsString() updatePolicy?: string;
  @IsOptional() @IsString() legalNotes?: string;
  @IsOptional() @IsDateString() lastPolicyCheckedAt?: string;
}
