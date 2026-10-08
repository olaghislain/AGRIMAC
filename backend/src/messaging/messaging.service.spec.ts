import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { MessagingService } from './messaging.service';

describe('MessagingService', () => {
  it('rejects sending an empty message without attachments', async () => {
    const prisma = { conversationParticipant: { findUnique: jest.fn().mockResolvedValue({ conversationId: 'conversation-1', userId: 'user-1' }) } };
    const notifications = { notifyMessage: jest.fn() };
    const service = new MessagingService(prisma as never, notifications as never);

    await expect(service.send('user-1', 'conversation-1', {})).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects access from a non-participant', async () => {
    const prisma = { conversationParticipant: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new MessagingService(prisma as never, {} as never);

    await expect(service.assertParticipant('user-2', 'conversation-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates a message and notifies other participants', async () => {
    const created = { id: 'message-1', conversationId: 'conversation-1', body: 'Bonjour', createdAt: new Date(), attachments: [], sender: { id: 'user-1', phone: '+2290100000001' } };
    const prisma = {
      conversationParticipant: {
        findUnique: jest.fn().mockResolvedValue({ conversationId: 'conversation-1', userId: 'user-1' }),
        findMany: jest.fn().mockResolvedValue([{ userId: 'user-2' }]),
      },
      $transaction: jest.fn().mockImplementation(async callback => callback({ message: { create: jest.fn().mockResolvedValue(created) }, conversation: { update: jest.fn() } })),
    };
    const notifications = { notifyMessage: jest.fn().mockResolvedValue({ count: 1 }) };
    const service = new MessagingService(prisma as never, notifications as never);

    const result = await service.send('user-1', 'conversation-1', { body: ' Bonjour ' });

    expect(result.message).toEqual(created);
    expect(result.recipientIds).toEqual(['user-2']);
    expect(notifications.notifyMessage).toHaveBeenCalledWith(['user-2'], 'conversation-1');
  });
});
