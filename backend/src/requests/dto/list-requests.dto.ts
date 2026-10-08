import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListRequestsDto {
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
