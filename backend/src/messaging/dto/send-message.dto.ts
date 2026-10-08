import { IsArray, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageAttachmentDto {
  @IsString() @MaxLength(500) storageKey!: string;
  @IsString() @MaxLength(255) originalName!: string;
  @IsString() @MaxLength(120) mimeType!: string;
  @IsInt() @Min(1) @Max(20 * 1024 * 1024) sizeBytes!: number;
  @IsOptional() @IsUrl({ require_tld: false }) url?: string;
}

export class SendMessageDto {
  @IsOptional() @IsString() @MaxLength(5000) body?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => MessageAttachmentDto) attachments?: MessageAttachmentDto[];
}
