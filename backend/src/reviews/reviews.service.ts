import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: { targetUserId?: string; productId?: string; serviceId?: string }) {
    if (query.targetUserId && query.targetUserId !== userId) throw new ForbiddenException('Vous ne pouvez consulter que les avis liés à votre compte.');
    return this.prisma.review.findMany({ where: { ...(query.targetUserId ? { targetUserId: userId } : { authorId: userId }), ...(query.productId ? { productId: query.productId } : {}), ...(query.serviceId ? { serviceId: query.serviceId } : {}) }, include: { author: { select: { id: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async create(authorId: string, dto: CreateReviewDto) {
    const targets = [dto.targetUserId, dto.productId, dto.serviceId].filter(Boolean);
    if (targets.length !== 1) throw new BadRequestException('Un avis doit cibler exactement un utilisateur, produit ou service.');
    if (dto.targetUserId && !await this.prisma.user.findUnique({ where: { id: dto.targetUserId } })) throw new NotFoundException('Utilisateur évalué introuvable.');
    if (dto.productId && !await this.prisma.product.findUnique({ where: { id: dto.productId } })) throw new NotFoundException('Produit évalué introuvable.');
    if (dto.serviceId && !await this.prisma.service.findUnique({ where: { id: dto.serviceId } })) throw new NotFoundException('Service évalué introuvable.');
    return this.prisma.review.create({ data: { authorId, targetUserId: dto.targetUserId, productId: dto.productId, serviceId: dto.serviceId, rating: dto.rating, comment: dto.comment } });
  }
}
