import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, query: ListRequestsDto) { return this.prisma.repairRequest.findMany({ where: { requesterId: userId, ...(query.status ? { status: query.status } : {}) }, include: { quotes: true, assignee: { select: { id: true, phone: true } } }, orderBy: { createdAt: 'desc' } }); }

  async get(userId: string, id: string) {
    const request = await this.prisma.repairRequest.findFirst({ where: { id, requesterId: userId }, include: { quotes: true, assignee: { select: { id: true, phone: true } } } });
    if (!request) throw new NotFoundException('Demande introuvable.');
    return request;
  }

  create(userId: string, dto: CreateRequestDto) { return this.prisma.repairRequest.create({ data: { requesterId: userId, kind: dto.kind, title: dto.title, description: dto.description, city: dto.city, region: dto.region, latitude: dto.latitude, longitude: dto.longitude, budgetXof: dto.budgetXof, status: RequestStatus.PUBLISHED } }); }

  async cancel(userId: string, id: string) {
    await this.get(userId, id);
    return this.prisma.repairRequest.update({ where: { id }, data: { status: RequestStatus.CANCELLED } });
  }
}
