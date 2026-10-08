import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  it('lists only orders belonging to the authenticated company', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new OrdersService({ companyProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'company-id' }) }, order: { findMany } } as never);
    await service.list('company-user');
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: 'company-id' } }));
  });
});
