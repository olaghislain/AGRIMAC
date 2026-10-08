import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class StatisticsQueryDto {
  @IsOptional() @IsDateString() start?: string;
  @IsOptional() @IsDateString() end?: string;
  @IsOptional() @IsIn(['day', 'month']) bucket: 'day' | 'month' = 'month';
}
