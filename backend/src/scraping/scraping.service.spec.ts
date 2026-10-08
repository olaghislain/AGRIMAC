import { ConflictException } from '@nestjs/common';
import { ScrapedAuthorizationStatus, ScrapeRunStatus, ScrapedSourceStatus } from '@prisma/client';
import { MachineNormalizerService } from './normalization/machine-normalizer.service';
import { ScrapingService } from './scraping.service';

describe('ScrapingService', () => {
  const source = { id: 'source-1', name: 'Fixture', baseUrl: 'fixture://agricultural-machines', status: ScrapedSourceStatus.ACTIVE, enabled: true, isFixture: true, requestDelayMs: 0, timeoutMs: 1000, maxPages: 10 } as never;
  it('creates records on the first run and reports duplicates on the second identical run', async () => {
    const repository = { findSource: jest.fn().mockResolvedValue(source), hasRunningRun: jest.fn().mockResolvedValue(false), createRun: jest.fn().mockResolvedValue({ id: 'run-1' }), updateRun: jest.fn(), updateSource: jest.fn(), upsertMachine: jest.fn().mockResolvedValueOnce({ action: 'created' }).mockResolvedValueOnce({ action: 'duplicate' }) };
    const fixture = { supports: jest.fn().mockReturnValue(true), scrape: jest.fn().mockResolvedValue({ pagesVisited: 1, machines: [{ name: 'Tracteur', sourceUrl: 'fixture://machine/1', currency: 'XOF' }] }) };
    const service = new ScrapingService(repository as never, { assertAllowed: jest.fn() } as never, new MachineNormalizerService(), { for: jest.fn().mockReturnValue(fixture) } as never);
    const first = await service.runSource('source-1');
    const second = await service.runSource('source-1');
    expect(first).toMatchObject({ status: ScrapeRunStatus.SUCCESS, itemsCreated: 1 });
    expect(second).toMatchObject({ status: ScrapeRunStatus.SUCCESS, duplicates: 1 });
  });

  it('records an error and fails the run when parsing fails', async () => {
    const repository = { findSource: jest.fn().mockResolvedValue(source), hasRunningRun: jest.fn().mockResolvedValue(false), createRun: jest.fn().mockResolvedValue({ id: 'run-2' }), updateRun: jest.fn(), createError: jest.fn() };
    const fixture = { supports: jest.fn().mockReturnValue(true), scrape: jest.fn().mockRejectedValue(new Error('HTML modifié')) };
    const service = new ScrapingService(repository as never, { assertAllowed: jest.fn() } as never, new MachineNormalizerService(), { for: jest.fn().mockReturnValue(fixture) } as never);
    const result = await service.runSource('source-1');
    expect(result.status).toBe(ScrapeRunStatus.FAILED);
    expect(repository.createError).toHaveBeenCalledWith('run-2', expect.objectContaining({ message: 'HTML modifié' }));
  });

  it('rejects a real source activated without authorization metadata', async () => {
    const service = new ScrapingService({} as never, {} as never, new MachineNormalizerService(), {} as never);
    await expect(service.createSource({ name: 'External', baseUrl: 'https://example.test', enabled: true })).rejects.toBeInstanceOf(ConflictException);
  });

  it('keeps every new source disabled and pending validation', async () => {
    const repository = { createSource: jest.fn().mockResolvedValue({ enabled: false, validationStatus: 'PENDING', status: 'INACTIVE' }) };
    const service = new ScrapingService(repository as never, {} as never, new MachineNormalizerService(), {} as never);
    const result = await service.createSource({ name: 'Fixture', baseUrl: 'fixture://agricultural-machines', isFixture: true, enabled: true });
    expect(result).toMatchObject({ enabled: false, validationStatus: 'PENDING', status: 'INACTIVE' });
    expect(repository.createSource).toHaveBeenCalledWith(expect.objectContaining({ enabled: false, validationStatus: 'PENDING', status: 'INACTIVE' }));
  });

  it('refuses activation when authorization evidence is incomplete', async () => {
    const source = { id: 'source-2', validationStatus: 'APPROVED', authorizationStatus: ScrapedAuthorizationStatus.AUTHORIZATION_REQUIRED };
    const repository = { findSource: jest.fn().mockResolvedValue(source) };
    const service = new ScrapingService(repository as never, {} as never, new MachineNormalizerService(), {} as never);
    await expect(service.activateSource('source-2')).rejects.toThrow('autorisation valide');
  });
});
