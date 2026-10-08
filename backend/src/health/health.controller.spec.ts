import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { MetricsService } from '../common/metrics/metrics.service';

describe('HealthController', () => {
  it('returns the health service result', async () => {
    const module = await Test.createTestingModule({ controllers: [HealthController], providers: [{ provide: HealthService, useValue: { check: jest.fn().mockResolvedValue({ status: 'ok' }) } }, { provide: MetricsService, useValue: { prometheus: jest.fn().mockReturnValue('') } }] }).compile();
    await expect(module.get(HealthController).check()).resolves.toEqual({ status: 'ok' });
  });
});
