import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSourceDto {
  @IsString() @MaxLength(160) name!: string;
  @IsString() @MaxLength(500) baseUrl!: string;
  @IsOptional() @IsString() @MaxLength(500) robotsUrl?: string;
  @IsOptional() @IsString() @MaxLength(500) termsUrl?: string;
  @IsOptional() @IsString() @MaxLength(500) apiUrl?: string;
  @IsOptional() @IsBoolean() enabled = false;
  @IsOptional() @IsBoolean() isFixture = false;
  @IsOptional() @IsInt() @Min(250) @Max(60000) requestDelayMs = 1500;
  @IsOptional() @IsInt() @Min(1000) @Max(120000) timeoutMs = 10000;
  @IsOptional() @IsInt() @Min(1) @Max(1000) maxPages = 10;
  @IsOptional() @IsInt() @Min(1) @Max(10000) maxItems = 500;
}
