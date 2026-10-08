import { MaintainersService } from './maintainers.service';

describe('MaintainersService', () => {
  it('updates a maintainer profile owned by the authenticated user', async () => {
    const profile = { id: 'profile-id', userId: 'user-id' };
    const update = jest.fn().mockResolvedValue({ ...profile, displayName: 'Updated' });
    const service = new MaintainersService({ technicianProfile: { findUnique: jest.fn().mockResolvedValue(profile), update } } as never);
    await service.updateProfile('user-id', { displayName: 'Updated' });
    expect(update).toHaveBeenCalledWith({ where: { userId: 'user-id' }, data: { displayName: 'Updated' } });
  });

  it('returns completed interventions as maintainer history', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 'intervention-id', status: 'COMPLETED' }]);
    const service = new MaintainersService({ intervention: { findMany } } as never);
    const history = await service.history('user-id');
    expect(history).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { technicianId: 'user-id', status: 'COMPLETED' } }));
  });

  it('limits published requests to active zones while keeping assigned requests', async () => {
    const service = new MaintainersService({
      technicianProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'profile-id', zones: [{ active: true, city: 'Calavi', region: 'Atlantique' }] }) },
      repairRequest: { findMany: jest.fn().mockResolvedValueOnce([{ id: 'published-in-zone', assigneeId: null, status: 'PUBLISHED', city: 'Calavi', region: 'Atlantique' }]).mockResolvedValueOnce([{ id: 'assigned', assigneeId: 'user-id', status: 'IN_PROGRESS', city: 'Other' }]) },
    } as never);
    const result = await service.requests('user-id');
    expect(result.map(item => item.id)).toEqual(['assigned', 'published-in-zone']);
  });
});
