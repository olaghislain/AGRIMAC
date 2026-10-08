import { Injectable } from '@nestjs/common';
import { Prisma, ProductKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchCatalogDto } from './dto/search-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: SearchCatalogDto) {
    const text = query.q?.trim();
    const productWhere: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      ...(query.kind ? { kind: query.kind } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.region ? { region: { equals: query.region, mode: 'insensitive' } } : {}),
      ...(text ? { OR: [{ title: { contains: text, mode: 'insensitive' } }, { description: { contains: text, mode: 'insensitive' } }] } : {}),
    };
    const serviceWhere: Prisma.ServiceWhereInput = {
      status: 'PUBLISHED',
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.city ? { city: { equals: query.city, mode: 'insensitive' } } : {}),
      ...(query.region ? { region: { equals: query.region, mode: 'insensitive' } } : {}),
      ...(text ? { OR: [{ title: { contains: text, mode: 'insensitive' } }, { description: { contains: text, mode: 'insensitive' } }] } : {}),
    };
    const [products, services, productCount, serviceCount] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where: productWhere, include: { category: true, company: { select: { id: true, legalName: true, city: true, region: true } } }, orderBy: { createdAt: 'desc' }, skip: query.latitude === undefined ? query.skip : undefined, take: query.latitude === undefined ? query.limit : undefined }),
      this.prisma.service.findMany({ where: serviceWhere, include: { category: true, company: { select: { id: true, legalName: true, city: true, region: true } }, technician: { select: { id: true, displayName: true, city: true, region: true } } }, orderBy: { createdAt: 'desc' }, skip: query.latitude === undefined ? query.skip : undefined, take: query.latitude === undefined ? query.limit : undefined }),
      this.prisma.product.count({ where: productWhere }),
      this.prisma.service.count({ where: serviceWhere }),
    ]);
    if (query.latitude === undefined || query.longitude === undefined) return { products, services, total: productCount + serviceCount, pagination: { limit: query.limit, skip: query.skip } };
    const all = [...products.map(item => ({ type: 'product' as const, item, distanceKm: this.distanceKm(query.latitude!, query.longitude!, item.latitude, item.longitude) })), ...services.map(item => ({ type: 'service' as const, item, distanceKm: this.distanceKm(query.latitude!, query.longitude!, item.latitude, item.longitude) }))].filter(item => item.distanceKm !== null && item.distanceKm <= query.radiusKm).sort((a, b) => a.distanceKm! - b.distanceKm!);
    const page = all.slice(query.skip, query.skip + query.limit);
    return { products: page.filter(item => item.type === 'product').map(item => ({ ...item.item, distanceKm: item.distanceKm })), services: page.filter(item => item.type === 'service').map(item => ({ ...item.item, distanceKm: item.distanceKm })), total: all.length, pagination: { limit: query.limit, skip: query.skip }, location: { latitude: query.latitude, longitude: query.longitude, radiusKm: query.radiusKm } };
  }

  async nearbyMaintainers(latitude: number, longitude: number, radiusKm: number, limit: number) {
    const profiles = await this.prisma.technicianProfile.findMany({ where: { latitude: { not: null }, longitude: { not: null }, user: { status: { in: ['ACTIVE', 'APPROVED'] } } }, include: { zones: { where: { active: true } }, availability: true } });
    return profiles.map(profile => ({ ...profile, distanceKm: this.distanceKm(latitude, longitude, profile.latitude, profile.longitude) })).filter(profile => profile.distanceKm !== null && profile.distanceKm <= radiusKm).sort((a, b) => a.distanceKm! - b.distanceKm!).slice(0, limit);
  }

  private distanceKm(latitude: number, longitude: number, targetLatitude: unknown, targetLongitude: unknown) {
    if (targetLatitude === null || targetLongitude === null || targetLatitude === undefined || targetLongitude === undefined) return null;
    const toRadians = (value: number) => value * Math.PI / 180;
    const lat = Number(targetLatitude);
    const lng = Number(targetLongitude);
    const dLat = toRadians(lat - latitude);
    const dLng = toRadians(lng - longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(latitude)) * Math.cos(toRadians(lat)) * Math.sin(dLng / 2) ** 2;
    return Number((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(3));
  }

  categories() { return this.prisma.category.findMany({ orderBy: { name: 'asc' } }); }
}
