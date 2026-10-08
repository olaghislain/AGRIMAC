import { RequestsService } from './requests.service';

describe('RequestsService', () => {
  it('creates a published farmer request with the provided data', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'request-id', status: 'PUBLISHED' });
    const service = new RequestsService({ repairRequest: { create } } as never);
    const result = await service.create('farmer-id', { kind: 'REPAIR', title: 'Pompe', description: 'Réparer la pompe', city: 'Cotonou' });
    expect(result).toEqual({ id: 'request-id', status: 'PUBLISHED' });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ requesterId: 'farmer-id', status: 'PUBLISHED', kind: 'REPAIR' }) }));
  });
});
