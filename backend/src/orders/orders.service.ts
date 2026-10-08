import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async company(userId: string) { const company = await this.prisma.companyProfile.findUnique({ where: { userId } }); if (!company) throw new NotFoundException('Profil entreprise introuvable.'); return company; }

  async list(userId: string) { const company = await this.company(userId); return this.prisma.order.findMany({ where: { companyId: company.id }, include: { buyer: { select: { id: true, phone: true } }, items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }); }

  async get(userId: string, id: string) { const company = await this.company(userId); const order = await this.prisma.order.findFirst({ where: { id, companyId: company.id }, include: { buyer: { select: { id: true, phone: true } }, items: { include: { product: true } } } }); if (!order) throw new NotFoundException('Commande introuvable.'); return order; }

  async updateStatus(userId: string, id: string, dto: UpdateOrderStatusDto) { await this.get(userId, id); return this.prisma.order.update({ where: { id }, data: { status: dto.status } }); }

  async createDevOrderForTests() { return { reference: `AGR-${randomUUID()}` }; }
}
