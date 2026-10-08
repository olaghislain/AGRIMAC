import { IsEnum, IsUUID } from 'class-validator';

export enum FavoriteTargetType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export class FavoriteDto {
  @IsEnum(FavoriteTargetType)
  targetType!: FavoriteTargetType;

  @IsUUID()
  targetId!: string;
}
