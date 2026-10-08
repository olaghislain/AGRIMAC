import { BadRequestException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  it('requires exactly one review target', async () => {
    const service = new ReviewsService({} as never);
    await expect(service.create('user-id', { rating: 5, targetUserId: 'a', productId: 'b' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns only reviews authored by the connected user and does not select phone data', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new ReviewsService({ review: { findMany } } as never);
    await service.list('user-id', {});
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { authorId: 'user-id' }, include: { author: { select: { id: true } } } }));
  });

  it('rejects reading another user target', async () => {
    const service = new ReviewsService({} as never);
    await expect(service.list('user-id', { targetUserId: 'other-user' })).rejects.toThrow('Vous ne pouvez consulter que les avis liés à votre compte.');
  });
});
