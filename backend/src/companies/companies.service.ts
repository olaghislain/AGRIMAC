import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';
import { StatisticsQueryDto } from './dto/statistics-query.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private async company(userId: string) {
    const company = await this.prisma.companyProfile.findUnique({ where: { userId } });
    if (!company) throw new NotFoundException('Profil entreprise introuvable.');
    return company;
  }

  private slug(value: string) { return `${value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`; }

  async listProducts(userId: string) { const company = await this.company(userId); return this.prisma.product.findMany({ where: { companyId: company.id }, include: { category: true }, orderBy: { createdAt: 'desc' } }); }

  async createProduct(userId: string, dto: CreateProductDto) { const company = await this.company(userId); return this.prisma.product.create({ data: { companyId: company.id, title: dto.title, slug: this.slug(dto.title), description: dto.description, kind: dto.kind, status: dto.status || 'DRAFT', priceXof: dto.priceXof, stock: dto.stock ?? 0, categoryId: dto.categoryId, city: dto.city || company.city, region: dto.region || company.region, latitude: dto.latitude, longitude: dto.longitude, imageUrl: dto.imageUrl } }); }

  async updateProduct(userId: string, id: string, dto: UpdateProductDto) { const company = await this.company(userId); const existing = await this.prisma.product.findFirst({ where: { id, companyId: company.id } }); if (!existing) throw new NotFoundException('Produit introuvable.'); return this.prisma.product.update({ where: { id }, data: { ...dto, ...(dto.title && dto.title !== existing.title ? { slug: this.slug(dto.title) } : {}) } }); }

  async deleteProduct(userId: string, id: string) { const company = await this.company(userId); const result = await this.prisma.product.updateMany({ where: { id, companyId: company.id }, data: { status: 'ARCHIVED' } }); if (!result.count) throw new NotFoundException('Produit introuvable.'); return { success: true, archived: true }; }

  async listServices(userId: string) { const company = await this.company(userId); return this.prisma.service.findMany({ where: { companyId: company.id }, include: { category: true }, orderBy: { createdAt: 'desc' } }); }

  async createService(userId: string, dto: CreateServiceDto) { const company = await this.company(userId); return this.prisma.service.create({ data: { companyId: company.id, title: dto.title, slug: this.slug(dto.title), description: dto.description, status: dto.status || 'DRAFT', priceXof: dto.priceXof, categoryId: dto.categoryId, city: dto.city || company.city, region: dto.region || company.region, latitude: dto.latitude, longitude: dto.longitude } }); }

  async updateService(userId: string, id: string, dto: UpdateServiceDto) { const company = await this.company(userId); const existing = await this.prisma.service.findFirst({ where: { id, companyId: company.id } }); if (!existing) throw new NotFoundException('Service introuvable.'); return this.prisma.service.update({ where: { id }, data: { ...dto, ...(dto.title && dto.title !== existing.title ? { slug: this.slug(dto.title) } : {}) } }); }

  async deleteService(userId: string, id: string) { const company = await this.company(userId); const result = await this.prisma.service.updateMany({ where: { id, companyId: company.id }, data: { status: 'ARCHIVED' } }); if (!result.count) throw new NotFoundException('Service introuvable.'); return { success: true, archived: true }; }

  async stats(userId: string) { const company = await this.company(userId); const [products, activeProducts, orders, revenue, pendingQuotes] = await Promise.all([this.prisma.product.count({ where: { companyId: company.id } }), this.prisma.product.count({ where: { companyId: company.id, status: 'PUBLISHED' } }), this.prisma.order.count({ where: { companyId: company.id } }), this.prisma.order.aggregate({ where: { companyId: company.id, status: { not: 'CANCELLED' } }, _sum: { totalXof: true } }), this.prisma.quote.count({ where: { companyId: company.id, status: 'SENT' } })]); return { products, activeProducts, orders, revenueXof: revenue._sum.totalXof || 0, pendingQuotes }; }

  async getCompany(userId: string) { return this.company(userId); }
  async updateCompany(userId: string, dto: UpdateCompanyProfileDto) { const company = await this.company(userId); return this.prisma.companyProfile.update({ where: { id: company.id }, data: dto }); }
  async timeseries(userId: string, query: StatisticsQueryDto) { const company = await this.company(userId); const end = query.end ? new Date(query.end) : new Date(); const start = query.start ? new Date(query.start) : new Date(end.getTime() - 180 * 24 * 60 * 60 * 1000); const orders = await this.prisma.order.findMany({ where: { companyId: company.id, createdAt: { gte: start, lte: end } }, select: { createdAt: true, totalXof: true, status: true } }); const groups = new Map<string, { revenueXof: number; orders: number }>(); for (const order of orders) { const date = order.createdAt.toISOString().slice(0, query.bucket === 'day' ? 10 : 7); const current = groups.get(date) || { revenueXof: 0, orders: 0 }; current.orders += 1; if (order.status !== 'CANCELLED') current.revenueXof += order.totalXof; groups.set(date, current); } return { start, end, bucket: query.bucket, points: [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, ...values })) }; }
  async reportSummary(userId: string) { const company = await this.company(userId); const [products, services, orders, quotes, revenue] = await Promise.all([this.prisma.product.count({ where: { companyId: company.id } }), this.prisma.service.count({ where: { companyId: company.id } }), this.prisma.order.count({ where: { companyId: company.id } }), this.prisma.quote.count({ where: { companyId: company.id } }), this.prisma.order.aggregate({ where: { companyId: company.id, status: { not: 'CANCELLED' } }, _sum: { totalXof: true } })]); return { company: { id: company.id, legalName: company.legalName }, generatedAt: new Date(), products, services, orders, quotes, revenueXof: revenue._sum.totalXof || 0 }; }
}
