import { Injectable } from '@nestjs/common';
import { Prisma, ScrapeRunStatus, ScrapedAuthorizationStatus, ScrapedSourceStatus, ScrapedSourceValidationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NormalizedMachine } from './interfaces/normalized-machine.interface';

@Injectable()
export class ScrapingRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSource(data: Prisma.ScrapedSourceCreateInput) { return this.prisma.scrapedSource.create({ data }); }
  updateSource(id: string, data: Prisma.ScrapedSourceUpdateInput) { return this.prisma.scrapedSource.update({ where: { id }, data }); }
  listSources() { return this.prisma.scrapedSource.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { machines: true, runs: true } } } }); }
  findSource(id: string) { return this.prisma.scrapedSource.findUnique({ where: { id } }); }
  getSource(id: string) { return this.prisma.scrapedSource.findUnique({ where: { id }, include: { _count: { select: { machines: true, runs: true } }, runs: { orderBy: { createdAt: 'desc' }, take: 1, include: { _count: { select: { errors: true } } } } } }); }
  deleteSource(id: string) { return this.prisma.scrapedSource.delete({ where: { id } }); }
  createRun(sourceId: string) { return this.prisma.scrapeRun.create({ data: { sourceId } }); }
  updateRun(id: string, data: Prisma.ScrapeRunUpdateInput) { return this.prisma.scrapeRun.update({ where: { id }, data }); }
  getRun(id: string) { return this.prisma.scrapeRun.findUnique({ where: { id }, include: { source: true, errors: { orderBy: { createdAt: 'asc' } } } }); }
  listRuns(limit: number, skip: number) { return this.prisma.scrapeRun.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip, include: { source: { select: { id: true, name: true } }, _count: { select: { errors: true } } } }); }
  listErrors(limit: number, skip: number) { return this.prisma.scrapeError.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip, include: { run: { include: { source: { select: { id: true, name: true } } } } } }); }
  listMachines(limit: number, skip: number) { return this.prisma.scrapedMachine.findMany({ orderBy: { scrapedAt: 'desc' }, take: limit, skip, include: { source: { select: { id: true, name: true } } } }); }
  async sourceStats(id: string) {
    const [source, categories, runs] = await this.prisma.$transaction([
      this.prisma.scrapedSource.findUnique({ where: { id }, include: { _count: { select: { machines: true, runs: true } } } }),
      this.prisma.scrapedMachine.findMany({ where: { sourceId: id }, select: { category: true } }),
      this.prisma.scrapeRun.findMany({ where: { sourceId: id }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);
    const categoryCounts = new Map<string, number>();
    for (const item of categories) { const key = item.category || 'Non classé'; categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1); }
    return { source, categories: [...categoryCounts.entries()].map(([category, count]) => ({ category, count })), runs };
  }
  createError(runId: string, data: { url?: string; statusCode?: number; errorType: string; message: string }) { return this.prisma.scrapeError.create({ data: { runId, ...data } }); }

  async upsertMachine(sourceId: string, machine: NormalizedMachine & { canonicalKey: string }) {
    const existing = await this.prisma.scrapedMachine.findFirst({ where: { sourceId, OR: [{ canonicalKey: machine.canonicalKey }, ...(machine.externalId ? [{ externalId: machine.externalId }] : []), { sourceUrl: machine.sourceUrl }] } });
    const data = { externalId: machine.externalId, canonicalKey: machine.canonicalKey, sourceUrl: machine.sourceUrl, name: machine.name, brand: machine.brand, model: machine.model, category: machine.category, machineType: machine.machineType, description: machine.description, technicalSpecs: machine.technicalSpecs as Prisma.InputJsonValue | undefined, price: machine.price, currency: machine.currency, availability: machine.availability, location: machine.location, imageUrl: machine.imageUrl, scrapedAt: new Date() };
    if (!existing) return { action: 'created' as const, machine: await this.prisma.scrapedMachine.create({ data: { source: { connect: { id: sourceId } }, ...data } }) };
    const changed = ['externalId', 'canonicalKey', 'sourceUrl', 'name', 'brand', 'model', 'category', 'machineType', 'description', 'price', 'currency', 'availability', 'location', 'imageUrl'].some(key => String((existing as Record<string, unknown>)[key] ?? '') !== String((data as Record<string, unknown>)[key] ?? '')) || this.stableJson(existing.technicalSpecs || {}) !== this.stableJson(machine.technicalSpecs || {});
    if (!changed) return { action: 'duplicate' as const, machine: existing };
    return { action: 'updated' as const, machine: await this.prisma.scrapedMachine.update({ where: { id: existing.id }, data }) };
  }

  async hasRunningRun(sourceId: string) { return Boolean(await this.prisma.scrapeRun.findFirst({ where: { sourceId, status: ScrapeRunStatus.RUNNING } })); }
  async activeSources() { return this.prisma.scrapedSource.findMany({ where: { enabled: true, status: ScrapedSourceStatus.ACTIVE, validationStatus: ScrapedSourceValidationStatus.APPROVED, authorizationStatus: ScrapedAuthorizationStatus.AUTHORIZED, isFixture: false, OR: [{ nextRunAt: null }, { nextRunAt: { lte: new Date() } }] } }); }
  private stableJson(value: unknown): string { if (Array.isArray(value)) return `[${value.map(item => this.stableJson(item)).sort().join(',')}]`; if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${this.stableJson(item)}`).join(',')}}`; return JSON.stringify(value); }
}
