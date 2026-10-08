import { CatalogService } from './catalog.service';

describe('CatalogService geolocation', () => {
  it('sorts mixed catalogue results by distance and applies the radius', async () => {
    const prisma = {
      product: { findMany: jest.fn().mockReturnValue({ operation: 'findMany' }), count: jest.fn().mockReturnValue({ operation: 'count' }) },
      service: { findMany: jest.fn().mockReturnValue({ operation: 'findMany' }), count: jest.fn().mockReturnValue({ operation: 'count' }) },
      $transaction: jest.fn().mockResolvedValue([
        [
          { id: 'far-product', title: 'Far', latitude: 7.5, longitude: 2.7, category: null, company: null },
          { id: 'near-product', title: 'Near', latitude: 6.37, longitude: 2.43, category: null, company: null },
        ],
        [],
        2,
        0,
      ]),
      technicianProfile: { findMany: jest.fn() },
    };
    const service = new CatalogService(prisma as never);
    const result = await service.search({ latitude: 6.37, longitude: 2.43, radiusKm: 5, limit: 20, skip: 0 });

    expect(result.total).toBe(1);
    expect(result.products[0].id).toBe('near-product');
    expect((result.products[0] as { distanceKm: number }).distanceKm).toBe(0);
  });

  it('returns nearby maintainers sorted by distance', async () => {
    const prisma = { technicianProfile: { findMany: jest.fn().mockResolvedValue([{ id: 'near', latitude: 6.37, longitude: 2.43, zones: [], availability: [] }, { id: 'far', latitude: 7.5, longitude: 2.7, zones: [], availability: [] }]) } };
    const service = new CatalogService(prisma as never);

    const result = await service.nearbyMaintainers(6.37, 2.43, 5, 20);

    expect(result.map(item => item.id)).toEqual(['near']);
  });
});
