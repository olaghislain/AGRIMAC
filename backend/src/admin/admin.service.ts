import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AccountStatus, ListingStatus, ModerationStatus, ModerationTargetType, Prisma, RoleCode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { ModerateProductDto } from './dto/moderate-product.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

const safeUserInclude = {
  roles: { include: { role: true } },
  farmerProfile: true,
  companyProfile: true,
  technicianProfile: true,
  adminProfile: true,
} satisfies Prisma.UserInclude;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async users(query: ListUsersDto) {
    const text = query.q?.trim();
    const where: Prisma.UserWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.role ? { roles: { some: { role: { code: query.role } } } } : {}),
      ...(text ? { OR: [{ phone: { contains: text } }, { email: { contains: text, mode: 'insensitive' } }] } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, include: safeUserInclude, orderBy: { createdAt: 'desc' }, take: query.limit, skip: query.skip }),
      this.prisma.user.count({ where }),
    ]);
    return { items: items.map(item => this.serializeUser(item)), total, pagination: { limit: query.limit, skip: query.skip } };
  }

  async user(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: safeUserInclude });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return this.serializeUser(user);
  }

  async updateUserStatus(actorId: string, id: string, dto: UpdateUserStatusDto) {
    if (actorId === id) throw new ForbiddenException('Un administrateur ne peut pas modifier son propre statut.');
    const user = await this.prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } });
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    const updated = await this.prisma.$transaction(async transaction => {
      const result = await transaction.user.update({ where: { id }, data: { status: dto.status } });
      await transaction.auditLog.create({ data: { actorId, action: `USER_STATUS_${dto.status}`, entityType: 'USER', entityId: id, metadata: { previousStatus: user.status, note: dto.note || null } } });
      return result;
    });
    return { id: updated.id, status: updated.status, previousStatus: user.status };
  }

  approveUser(actorId: string, id: string, note?: string) { return this.updateUserStatus(actorId, id, { status: AccountStatus.APPROVED, note }); }
  suspendUser(actorId: string, id: string, note?: string) { return this.updateUserStatus(actorId, id, { status: AccountStatus.SUSPENDED, note }); }
  reactivateUser(actorId: string, id: string, note?: string) { return this.updateUserStatus(actorId, id, { status: AccountStatus.ACTIVE, note }); }

  async products(status?: ListingStatus) { return this.prisma.product.findMany({ where: status ? { status } : {}, include: { company: { select: { id: true, legalName: true } }, category: true }, orderBy: { createdAt: 'desc' } }); }

  async moderateProduct(actorId: string, id: string, dto: ModerateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produit introuvable.');
    const updated = await this.prisma.$transaction(async transaction => {
      const result = await transaction.product.update({ where: { id }, data: { status: dto.status } });
      await transaction.auditLog.create({ data: { actorId, action: `PRODUCT_STATUS_${dto.status}`, entityType: 'PRODUCT', entityId: id, metadata: { previousStatus: product.status, note: dto.note || null } } });
      return result;
    });
    return { id: updated.id, status: updated.status, previousStatus: product.status };
  }

  async createReport(reporterId: string, dto: CreateReportDto) {
    if (dto.targetType === ModerationTargetType.USER) {
      if (!await this.prisma.user.findUnique({ where: { id: dto.targetId } })) throw new NotFoundException('Utilisateur signalé introuvable.');
      return this.prisma.moderationReport.create({ data: { reporterId, reportedUserId: dto.targetId, targetType: dto.targetType, reason: dto.reason } });
    }
    if (!await this.prisma.product.findUnique({ where: { id: dto.targetId } })) throw new NotFoundException('Produit signalé introuvable.');
    return this.prisma.moderationReport.create({ data: { reporterId, productId: dto.targetId, targetType: dto.targetType, reason: dto.reason } });
  }

  async reports(status?: ModerationStatus) { return this.prisma.moderationReport.findMany({ where: status ? { status } : {}, include: { reporter: { select: { id: true, phone: true } }, reportedUser: { select: { id: true, phone: true, status: true } }, product: { select: { id: true, title: true, status: true } } }, orderBy: { createdAt: 'desc' } }); }

  async resolveReport(actorId: string, id: string, dto: ResolveReportDto) {
    const report = await this.prisma.moderationReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Signalement introuvable.');
    return this.prisma.$transaction(async transaction => {
      const updated = await transaction.moderationReport.update({ where: { id }, data: { status: dto.status, resolutionNote: dto.resolutionNote } });
      await transaction.auditLog.create({ data: { actorId, action: `REPORT_${dto.status}`, entityType: 'MODERATION_REPORT', entityId: id, metadata: { note: dto.resolutionNote || null } } });
      return updated;
    });
  }

  async stats() {
    const [users, companies, maintainers, farmers, pendingUsers, products, requests, orders, payments, reports, volume] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { roles: { some: { role: { code: RoleCode.ENTREPRISE } } } } }),
      this.prisma.user.count({ where: { roles: { some: { role: { code: RoleCode.MAINTENANCIER } } } } }),
      this.prisma.user.count({ where: { roles: { some: { role: { code: RoleCode.AGRICULTEUR } } } } }),
      this.prisma.user.count({ where: { status: { in: [AccountStatus.PENDING, AccountStatus.REJECTED] } } }),
      this.prisma.product.count({ where: { status: { not: ListingStatus.ARCHIVED } } }),
      this.prisma.repairRequest.count(),
      this.prisma.order.count(),
      this.prisma.payment.count(),
      this.prisma.moderationReport.count({ where: { status: { in: [ModerationStatus.OPEN, ModerationStatus.IN_REVIEW] } } }),
      this.prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amountXof: true } }),
    ]);
    return { users, companies, maintainers, farmers, pendingUsers, activeProducts: products, requests, orders, payments, openReports: reports, paymentVolumeXof: volume._sum.amountXof || 0 };
  }

  async auditLogs(limit = 100) { return this.prisma.auditLog.findMany({ include: { actor: { select: { id: true, phone: true } } }, orderBy: { createdAt: 'desc' }, take: Math.min(limit, 200) }); }

  private serializeUser(user: Prisma.UserGetPayload<{ include: typeof safeUserInclude }>) { return { id: user.id, phone: user.phone, email: user.email, status: user.status, phoneVerifiedAt: user.phoneVerifiedAt, roles: user.roles.map(item => item.role.code), profile: user.farmerProfile || user.companyProfile || user.technicianProfile || user.adminProfile || null, createdAt: user.createdAt, updatedAt: user.updatedAt }; }
}
