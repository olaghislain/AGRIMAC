import { InterventionStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateInterventionStatusDto {
  @IsEnum(InterventionStatus)
  status!: InterventionStatus;
}
