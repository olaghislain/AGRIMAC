import { CompaniesService } from './companies.service';

describe('CompaniesService', () => {
  it('creates a product owned by the authenticated company', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'product-id' });
    const service = new CompaniesService({ companyProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'company-id', city: 'Cotonou', region: 'Littoral' }) }, product: { create } } as never);
    await service.createProduct('company-user', { title: 'Tracteur', kind: 'MACHINE', priceXof: 100000, stock: 1 });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ companyId: 'company-id', title: 'Tracteur', kind: 'MACHINE' }) }));
  });
});
