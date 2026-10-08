import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, InterventionStatus, QuoteStatus, RequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityDto } from './dto/availability.dto';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionStatusDto } from './dto/update-intervention-status.dto';
import { UpdateMaintainerProfileDto } from './dto/update-maintainer-profile.dto';
import { ZoneDto } from './dto/zone.dto';

@Injectable()
export class MaintainersService {
  constructor(private readonly prisma: PrismaService) {}

  private async profile(userId: string) {
    const profile = await this.prisma.technicianProfile.findUnique({ where: { userId }, include: { zones: true, availability: true } });
    if (!profile) throw new NotFoundException('Profil maintenancier introuvable.');
    return profile;
  }

  async getProfile(userId: string) { return this.profile(userId); }

  async updateProfile(userId: string, dto: UpdateMaintainerProfileDto) {
    await this.profile(userId);
    return this.prisma.technicianProfile.update({ where: { userId }, data: dto });
  }

  async listZones(userId: string) { const profile = await this.profile(userId); return this.prisma.technicianZone.findMany({ where: { technicianId: profile.id }, orderBy: { createdAt: 'desc' } }); }

  async createZone(userId: string, dto: ZoneDto) { const profile = await this.profile(userId); return this.prisma.technicianZone.create({ data: { technicianId: profile.id, ...dto } }); }

  async updateZone(userId: string, id: string, dto: ZoneDto) { const profile = await this.profile(userId); const zone = await this.prisma.technicianZone.findFirst({ where: { id, technicianId: profile.id } }); if (!zone) throw new NotFoundException('Zone introuvable.'); return this.prisma.technicianZone.update({ where: { id }, data: dto }); }

  async deleteZone(userId: string, id: string) { const profile = await this.profile(userId); const result = await this.prisma.technicianZone.deleteMany({ where: { id, technicianId: profile.id } }); if (!result.count) throw new NotFoundException('Zone introuvable.'); return { success: true }; }

  async availability(userId: string) { const profile = await this.profile(userId); return this.prisma.availabilitySlot.findMany({ where: { technicianId: profile.id }, orderBy: { dayOfWeek: 'asc' } }); }

  async setAvailability(userId: string, dto: AvailabilityDto) { const profile = await this.profile(userId); return this.prisma.availabilitySlot.upsert({ where: { technicianId_dayOfWeek: { technicianId: profile.id, dayOfWeek: dto.dayOfWeek } }, update: { startTime: dto.startTime, endTime: dto.endTime, status: dto.status }, create: { technicianId: profile.id, ...dto } }); }

  async requests(userId: string) {
    const profile = await this.profile(userId);
    const zones = profile.zones.filter(zone => zone.active);
    const published = await this.prisma.repairRequest.findMany({ where: { assigneeId: null, status: RequestStatus.PUBLISHED }, include: { requester: { select: { id: true, phone: true, farmerProfile: true } }, quotes: true }, orderBy: { createdAt: 'desc' } });
    const assigned = await this.prisma.repairRequest.findMany({ where: { assigneeId: userId }, include: { requester: { select: { id: true, phone: true, farmerProfile: true } }, quotes: true }, orderBy: { createdAt: 'desc' } });
    const normalize = (value: string | null | undefined) => String(value || '').trim().toLocaleLowerCase();
    const inZone = (request: { city?: string | null; region?: string | null }) => zones.some(zone => normalize(zone.city) && normalize(zone.city) === normalize(request.city) && (!normalize(zone.region) || normalize(zone.region) === normalize(request.region)));
    return [...assigned, ...published.filter(inZone)];
  }

  async acceptRequest(userId: string, id: string) {
    const available = await this.requests(userId);
    const request = available.find(item => item.id === id && item.assigneeId == null && item.status === RequestStatus.PUBLISHED);
    if (!request) throw new NotFoundException('Demande disponible introuvable.');
    return this.prisma.repairRequest.update({ where: { id }, data: { assigneeId: userId, status: RequestStatus.ACCEPTED } });
  }

  async quotes(userId: string) { await this.profile(userId); return this.prisma.quote.findMany({ where: { authorId: userId }, include: { request: true }, orderBy: { createdAt: 'desc' } }); }

  async createQuote(userId: string, requestId: string, amountXof: number, message?: string) {
    await this.profile(userId);
    const request = await this.prisma.repairRequest.findFirst({ where: { id: requestId, assigneeId: userId } });
    if (!request) throw new ForbiddenException('La demande doit être acceptée par ce maintenancier.');
    return this.prisma.$transaction(async transaction => {
      const quote = await transaction.quote.create({ data: { requestId, authorId: userId, amountXof, message, status: QuoteStatus.SENT } });
      await transaction.repairRequest.update({ where: { id: requestId }, data: { status: RequestStatus.QUOTED } });
      return quote;
    });
  }

  async interventions(userId: string) { await this.profile(userId); return this.prisma.intervention.findMany({ where: { technicianId: userId }, include: { request: true, quote: true }, orderBy: { scheduledAt: 'asc' } }); }

  async createIntervention(userId: string, dto: CreateInterventionDto) {
    await this.profile(userId);
    if (dto.requestId && !await this.prisma.repairRequest.findFirst({ where: { id: dto.requestId, assigneeId: userId } })) throw new ForbiddenException('Demande non assignée à ce maintenancier.');
    if (dto.quoteId && !await this.prisma.quote.findFirst({ where: { id: dto.quoteId, authorId: userId } })) throw new ForbiddenException('Devis non associé à ce maintenancier.');
    return this.prisma.intervention.create({ data: { technicianId: userId, requestId: dto.requestId, quoteId: dto.quoteId, title: dto.title, description: dto.description, location: dto.location, scheduledAt: new Date(dto.scheduledAt), amountXof: dto.amountXof } });
  }

  async updateIntervention(userId: string, id: string, dto: UpdateInterventionStatusDto) {
    const item = await this.prisma.intervention.findFirst({ where: { id, technicianId: userId } });
    if (!item) throw new NotFoundException('Intervention introuvable.');
    return this.prisma.intervention.update({ where: { id }, data: { status: dto.status, completedAt: dto.status === InterventionStatus.COMPLETED ? new Date() : undefined } });
  }

  async history(userId: string) { return this.prisma.intervention.findMany({ where: { technicianId: userId, status: InterventionStatus.COMPLETED }, include: { request: true, quote: true }, orderBy: { completedAt: 'desc' } }); }

  async stats(userId: string) {
    const [requests, quotes, interventions, completed, revenue, reviews] = await Promise.all([
      this.prisma.repairRequest.count({ where: { assigneeId: userId } }),
      this.prisma.quote.count({ where: { authorId: userId } }),
      this.prisma.intervention.count({ where: { technicianId: userId } }),
      this.prisma.intervention.count({ where: { technicianId: userId, status: InterventionStatus.COMPLETED } }),
      this.prisma.intervention.aggregate({ where: { technicianId: userId, status: InterventionStatus.COMPLETED }, _sum: { amountXof: true } }),
      this.prisma.review.aggregate({ where: { targetUserId: userId }, _avg: { rating: true }, _count: { id: true } }),
    ]);
    return { requests, quotes, interventions, completed, revenueXof: revenue._sum.amountXof || 0, satisfaction: reviews._avg.rating || 0, reviewCount: reviews._count.id };
  }
}
