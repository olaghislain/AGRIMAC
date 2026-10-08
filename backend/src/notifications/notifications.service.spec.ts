import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  it('returns paginated notifications with the unread count', async () => {
    const prisma = {
      notification: {
        findMany: jest.fn().mockReturnValue({ operation: 'findMany' }),
        count: jest.fn().mockReturnValue({ operation: 'count' }),
      },
      $transaction: jest.fn().mockResolvedValue([[{ id: 'notification-1' }], 1, 1]),
    };
    const service = new NotificationsService(prisma as never);
    const result = await service.list('user-1', { limit: 10, skip: 0 });

    expect(result).toEqual({ items: [{ id: 'notification-1' }], total: 1, unread: 1, pagination: { limit: 10, skip: 0 } });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('creates notifications for unique recipients only', async () => {
    const prisma = { notification: { createMany: jest.fn().mockResolvedValue({ count: 2 }) } };
    const service = new NotificationsService(prisma as never);
    await service.createMany(['user-1', 'user-1', 'user-2'], { type: NotificationType.NEW_MESSAGE, title: 'Message', body: 'Bonjour' });

    expect(prisma.notification.createMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.arrayContaining([{ userId: 'user-1', type: NotificationType.NEW_MESSAGE, title: 'Message', body: 'Bonjour' }, { userId: 'user-2', type: NotificationType.NEW_MESSAGE, title: 'Message', body: 'Bonjour' }]) }));
  });

  it('rejects a notification that is not owned by the current user', async () => {
    const prisma = { notification: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) } };
    const service = new NotificationsService(prisma as never);
    await expect(service.remove('user-1', 'notification-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
