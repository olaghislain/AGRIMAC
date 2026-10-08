import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsArray() @ArrayMinSize(1) @IsUUID('4', { each: true }) participantIds!: string[];
  @IsOptional() @IsUUID('4') requestId?: string;
  @IsOptional() @IsUUID('4') quoteId?: string;
  @IsOptional() @IsString() @MaxLength(5000) initialMessage?: string;
}
