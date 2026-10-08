import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MessageStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { MessageAttachmentDto, SendMessageDto } from './dto/send-message.dto';

const participantSelect = { userId: true, joinedAt: true, lastReadAt: true, archivedAt: true, user: { select: { id: true, phone: true, farmerProfile: { select: { firstName: true, lastName: true } }, companyProfile: { select: { legalName: true } }, technicianProfile: { select: { displayName: true } } } } } satisfies Prisma.ConversationParticipantSelect;

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  async create(userId: string, dto: CreateConversationDto) {
    const participantIds = [...new Set([userId, ...dto.participantIds])];
    const users = await this.prisma.user.findMany({ where: { id: { in: participantIds } }, select: { id: true } });
    if (users.length !== participantIds.length) throw new NotFoundException('Un ou plusieurs participants sont introuvables.');
    await this.assertLinkedResources(userId, dto.requestId, dto.quoteId);
    const conversation = await this.prisma.conversation.create({
      data: { requestId: dto.requestId, quoteId: dto.quoteId, participants: { create: participantIds.map(id => ({ userId: id })) }, ...(dto.initialMessage?.trim() ? { messages: { create: { senderId: userId, body: dto.initialMessage.trim(), status: MessageStatus.SENT } }, lastMessageAt: new Date() } : {}) },
      include: { participants: { select: participantSelect }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (dto.initialMessage?.trim()) await this.notifications.notifyMessage(participantIds.filter(id => id !== userId), conversation.id);
    return conversation;
  }

  async list(userId: string, query: ListConversationsDto) {
    const where: Prisma.ConversationWhereInput = { participants: { some: { userId, ...(query.includeArchived === 'true' ? {} : { archivedAt: null }) } } };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.conversation.findMany({ where, orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }], take: query.limit, skip: query.skip, include: { participants: { select: participantSelect }, messages: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 1, include: { attachments: true } } } }),
      this.prisma.conversation.count({ where }),
    ]);
    return { items: items.map(item => ({ ...item, unread: this.isUnread(item.participants, item.messages[0]?.createdAt, userId) })), total, pagination: { limit: query.limit, skip: query.skip } };
  }

  async get(userId: string, id: string) {
    await this.assertParticipant(userId, id);
    return this.prisma.conversation.findUniqueOrThrow({ where: { id }, include: { participants: { select: participantSelect }, request: true, quote: true } });
  }

  async messages(userId: string, conversationId: string, query: ListMessagesDto) {
    await this.assertParticipant(userId, conversationId);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({ where: { conversationId, deletedAt: null }, orderBy: { createdAt: 'desc' }, take: query.limit, skip: query.skip, include: { attachments: true, sender: { select: { id: true, phone: true } } } }),
      this.prisma.message.count({ where: { conversationId, deletedAt: null } }),
    ]);
    return { items: items.reverse(), total, pagination: { limit: query.limit, skip: query.skip } };
  }

  async send(userId: string, conversationId: string, dto: SendMessageDto) {
    await this.assertParticipant(userId, conversationId);
    const body = dto.body?.trim();
    const attachments = dto.attachments || [];
    if (!body && !attachments.length) throw new BadRequestException('Un message ou une pièce jointe est requis.');
    const message = await this.prisma.$transaction(async transaction => {
      const created = await transaction.message.create({ data: { conversationId, senderId: userId, body: body || null, status: MessageStatus.SENT, attachments: attachments.length ? { create: attachments.map(item => this.attachmentData(item)) } : undefined }, include: { attachments: true, sender: { select: { id: true, phone: true } } } });
      await transaction.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: created.createdAt } });
      return created;
    });
    const recipients = await this.recipientIds(userId, conversationId);
    await this.notifications.notifyMessage(recipients, conversationId);
    return { message, recipientIds: recipients };
  }

  async markRead(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId);
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { lastReadAt: now } }),
      this.prisma.message.updateMany({ where: { conversationId, senderId: { not: userId }, status: { in: [MessageStatus.SENT, MessageStatus.DELIVERED] } }, data: { status: MessageStatus.READ, readAt: now } }),
    ]);
    return { conversationId, readAt: now };
  }

  async archive(userId: string, conversationId: string, archived: boolean) {
    await this.assertParticipant(userId, conversationId);
    return this.prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { archivedAt: archived ? new Date() : null } });
  }

  async removeConversation(userId: string, conversationId: string) {
    await this.assertParticipant(userId, conversationId);
    await this.prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId, userId } }, data: { archivedAt: new Date() } });
    return { success: true };
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({ where: { id: messageId, senderId: userId, deletedAt: null } });
    if (!message) throw new NotFoundException('Message introuvable.');
    await this.prisma.message.update({ where: { id: messageId }, data: { deletedAt: new Date(), body: null } });
    return { success: true };
  }

  async assertParticipant(userId: string, conversationId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
    if (!participant) throw new ForbiddenException('Vous ne participez pas à cette conversation.');
    return participant;
  }

  private async recipientIds(senderId: string, conversationId: string) { const participants = await this.prisma.conversationParticipant.findMany({ where: { conversationId, userId: { not: senderId } }, select: { userId: true } }); return participants.map(item => item.userId); }
  private async assertLinkedResources(userId: string, requestId?: string, quoteId?: string) { if (requestId && !await this.prisma.repairRequest.findFirst({ where: { id: requestId, OR: [{ requesterId: userId }, { assigneeId: userId }] } })) throw new ForbiddenException('La demande liée ne vous est pas accessible.'); if (quoteId && !await this.prisma.quote.findFirst({ where: { id: quoteId, OR: [{ authorId: userId }, { company: { userId } }] } })) throw new ForbiddenException('Le devis lié ne vous est pas accessible.'); }
  private attachmentData(item: MessageAttachmentDto) { return { storageKey: item.storageKey, originalName: item.originalName, mimeType: item.mimeType, sizeBytes: item.sizeBytes, isPrivate: true }; }
  private isUnread(participants: Array<{ userId: string; lastReadAt: Date | null }>, latest: Date | undefined, userId: string) { const participant = participants.find(item => item.userId === userId); return Boolean(latest && (!participant?.lastReadAt || latest > participant.lastReadAt)); }
}
