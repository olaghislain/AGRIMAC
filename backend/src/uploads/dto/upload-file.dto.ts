import { UploadPurpose } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadFileDto {
  @IsEnum(UploadPurpose) purpose!: UploadPurpose;
  @IsOptional() @IsString() @MaxLength(60) resourceType?: string;
  @IsOptional() @IsString() @MaxLength(80) resourceId?: string;
}
