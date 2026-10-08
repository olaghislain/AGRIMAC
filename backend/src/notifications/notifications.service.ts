import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: { userId, type: dto.type, title: dto.title, body: dto.body, data: dto.data as Prisma.InputJsonValue | undefined } });
  }

  async createMany(userIds: string[], dto: CreateNotificationDto) {
    const ids = [...new Set(userIds)].filter(Boolean);
    if (!ids.length) return { count: 0 };
    return this.prisma.notification.createMany({ data: ids.map(userId => ({ userId, type: dto.type, title: dto.title, body: dto.body, data: dto.data as Prisma.InputJsonValue | undefined })) });
  }

  async list(userId: string, query: ListNotificationsDto) {
    const where: Prisma.NotificationWhereInput = { userId, ...(query.unreadOnly === 'true' ? { readAt: null } : {}), ...(query.type ? { type: query.type } : {}) };
    const [items, total, unread] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: query.limit, skip: query.skip }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return { items, total, unread, pagination: { limit: query.limit, skip: query.skip } };
  }

  async markRead(userId: string, id: string) {
    const result = await this.prisma.notification.updateMany({ where: { id, userId, readAt: null }, data: { readAt: new Date() } });
    if (!result.count) throw new NotFoundException('Notification introuvable ou déjà lue.');
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
    return { updated: result.count };
  }

  async remove(userId: string, id: string) {
    const result = await this.prisma.notification.deleteMany({ where: { id, userId } });
    if (!result.count) throw new NotFoundException('Notification introuvable.');
    return { success: true };
  }

  async notifyMessage(userIds: string[], conversationId: string, senderName?: string) {
    return this.createMany(userIds, { type: NotificationType.NEW_MESSAGE, title: 'Nouveau message', body: senderName ? `${senderName} vous a envoyé un message.` : 'Vous avez reçu un nouveau message.', data: { conversationId } });
  }
}
