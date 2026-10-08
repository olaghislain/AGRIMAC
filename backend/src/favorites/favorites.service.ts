import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FavoriteDto, FavoriteTargetType } from './dto/favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) { return this.prisma.favorite.findMany({ where: { userId }, include: { product: { include: { category: true } }, service: { include: { category: true } } }, orderBy: { createdAt: 'desc' } }); }

  async add(userId: string, dto: FavoriteDto) {
    if (dto.targetType === FavoriteTargetType.PRODUCT) {
      if (!await this.prisma.product.findUnique({ where: { id: dto.targetId } })) throw new NotFoundException('Produit introuvable.');
      return this.prisma.favorite.upsert({ where: { userId_productId: { userId, productId: dto.targetId } }, update: {}, create: { userId, productId: dto.targetId } });
    }
    if (!await this.prisma.service.findUnique({ where: { id: dto.targetId } })) throw new NotFoundException('Service introuvable.');
    return this.prisma.favorite.upsert({ where: { userId_serviceId: { userId, serviceId: dto.targetId } }, update: {}, create: { userId, serviceId: dto.targetId } });
  }

  async remove(userId: string, dto: FavoriteDto) {
    const where = dto.targetType === FavoriteTargetType.PRODUCT ? { userId_productId: { userId, productId: dto.targetId } } : { userId_serviceId: { userId, serviceId: dto.targetId } };
    try { await this.prisma.favorite.delete({ where }); } catch { throw new BadRequestException('Favori introuvable.'); }
    return { success: true };
  }
}
