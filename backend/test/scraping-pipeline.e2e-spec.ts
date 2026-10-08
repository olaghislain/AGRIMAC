import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { ScrapingService } from '../src/scraping/scraping.service';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FixtureMachinesParser } from '../src/scraping/parsers/fixture-machines.parser';
import { MachineNormalizerService } from '../src/scraping/normalization/machine-normalizer.service';

describe('Scraping fixture pipeline (e2e)', () => {
  let prisma: PrismaService;
  let scraping: ScrapingService;
  const baseUrl = 'fixture://agricultural-machines';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    prisma = moduleRef.get(PrismaService);
    scraping = moduleRef.get(ScrapingService);
    await prisma.scrapedSource.deleteMany({ where: { baseUrl } });
  });

  afterAll(async () => { await prisma.scrapedSource.deleteMany({ where: { baseUrl } }); await prisma.$disconnect(); });

  it('creates fixture machines once and reports duplicates on the second run', async () => {
    const source = await scraping.createSource({ name: 'Fixture E2E', baseUrl, isFixture: true, enabled: true });
    await scraping.validateSource(source.id, true, 'Fixture locale de test', randomUUID());
    await scraping.updateAuthorization(source.id, { status: 'AUTHORIZED', authorizationGrantedAt: new Date().toISOString(), authorizationProofRef: 'test-fixture-authorization', dataExtractionAuthorized: true, listingReuseAuthorized: true, imageReuseStatus: 'NOT_AUTHORIZED', reuseImages: false, maxFrequencySeconds: 3600, maxRequests: 1, legalNotes: 'Fixture locale uniquement.' });
    await scraping.activateSource(source.id);
    const first = await scraping.runSource(source.id);
    const second = await scraping.runSource(source.id);
    const machines = await prisma.scrapedMachine.count({ where: { sourceId: source.id } });

    expect(first).toMatchObject({ status: 'SUCCESS', itemsCreated: 6, itemsFound: 6 });
    expect(second).toMatchObject({ status: 'SUCCESS', itemsCreated: 0 });
    expect((second.duplicates || 0) + (second.itemsUpdated || 0)).toBe(6);
    expect(machines).toBe(6);
    const firstMachine = await prisma.scrapedMachine.findFirst({ where: { sourceId: source.id } });
    await prisma.scrapedMachine.update({ where: { id: firstMachine!.id }, data: { description: 'Valeur modifiée uniquement pour le test E2E.' } });
    const fixtureMachines = new FixtureMachinesParser().parse(await readFile(join(process.cwd(), 'src', 'scraping', 'fixtures', 'agricultural-machines.html'), 'utf8')).map(item => new MachineNormalizerService().normalize(item));
    const dbMachines = await prisma.scrapedMachine.findMany({ where: { sourceId: source.id }, orderBy: { externalId: 'asc' } });
    const third = await scraping.runSource(source.id);
    expect(third).toMatchObject({ status: 'SUCCESS', itemsCreated: 0, itemsUpdated: 1 });
  }, 30000);
});
