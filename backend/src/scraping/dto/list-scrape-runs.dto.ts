import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListScrapeRunsDto {
  @IsOptional() @IsInt() @Min(1) @Max(100) limit = 25;
  @IsOptional() @IsInt() @Min(0) skip = 0;
}
