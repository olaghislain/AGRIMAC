import { Type } from 'class-transformer';
import { IsInt, IsLatitude, IsLongitude, Max, Min } from 'class-validator';

export class NearbyMaintainersDto {
  @Type(() => Number) @IsLatitude() latitude!: number;
  @Type(() => Number) @IsLongitude() longitude!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) radiusKm = 25;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limit = 20;
}
