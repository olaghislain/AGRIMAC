import { AvailabilityStatus } from '@prisma/client';
import { IsEnum, IsInt, IsString, Matches, Max, Min } from 'class-validator';

export class AvailabilityDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) startTime!: string;
  @IsString() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) endTime!: string;
  @IsEnum(AvailabilityStatus) status!: AvailabilityStatus;
}
