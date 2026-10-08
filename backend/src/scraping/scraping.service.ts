import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ScrapeRunStatus, ScrapedAuthorizationStatus, ScrapedImageReuseStatus, ScrapedSourceStatus, ScrapedSourceValidationStatus, Prisma } from '@prisma/client';
import { ScrapingPolicyService } from './scraping-policy.service';
import { ScrapingRepository } from './scraping.repository';
import { MachineNormalizerService } from './normalization/machine-normalizer.service';
import { FixtureMachinesScraper } from './sources/fixture-machines.scraper';
import { SourceScraperRegistry } from './sources/source-scraper.registry';

@Injectable()
export class ScrapingService {
  private readonly lockedSources = new Set<string>();
  constructor(private readonly repository: ScrapingRepository, private readonly policy: ScrapingPolicyService, private readonly normalizer: MachineNormalizerService, private readonly registry: SourceScraperRegistry) {}

  async createSource(input: { name: string; baseUrl: string; robotsUrl?: string; termsUrl?: string; apiUrl?: string; enabled?: boolean; isFixture?: boolean; requestDelayMs?: number; timeoutMs?: number; maxPages?: number; maxItems?: number }) {
    this.validateSourceInput(input);
    return this.repository.createSource({ name: input.name.trim(), baseUrl: input.baseUrl.trim(), robotsUrl: input.robotsUrl, termsUrl: input.termsUrl, apiUrl: input.apiUrl, enabled: false, isFixture: input.isFixture ?? false, status: ScrapedSourceStatus.INACTIVE, validationStatus: ScrapedSourceValidationStatus.PENDING, authorizationStatus: ScrapedAuthorizationStatus.PENDING_REVIEW, requestDelayMs: input.requestDelayMs ?? 1500, timeoutMs: input.timeoutMs ?? 10000, maxPages: input.maxPages ?? 10, maxItems: input.maxItems ?? 500 });
  }

  async updateSource(id: string, input: Record<string, unknown>) { const source = await this.repository.findSource(id); if (!source) throw new NotFoundException('Source introuvable.'); const changedPolicy = ['baseUrl', 'robotsUrl', 'termsUrl', 'apiUrl', 'isFixture'].some(key => input[key] !== undefined && input[key] !== (source as Record<string, unknown>)[key]); const data: Prisma.ScrapedSourceUpdateInput = { ...input, enabled: false, ...(changedPolicy ? { status: ScrapedSourceStatus.INACTIVE, validationStatus: ScrapedSourceValidationStatus.PENDING, authorizationStatus: ScrapedAuthorizationStatus.PENDING_REVIEW, validatedAt: null, validatedById: null, validationNotes: null } : {}) }; return this.repository.updateSource(id, data); }
  listSources() { return this.repository.listSources(); }
  async getSource(id: string) { const source = await this.repository.getSource(id); if (!source) throw new NotFoundException('Source introuvable.'); return source; }
  async sourceStats(id: string) { if (!await this.repository.findSource(id)) throw new NotFoundException('Source introuvable.'); return this.repository.sourceStats(id); }
  async deleteSource(id: string) { if (!await this.repository.findSource(id)) throw new NotFoundException('Source introuvable.'); await this.repository.deleteSource(id); return { success: true }; }

  async validateSource(id: string, approved: boolean, notes: string | undefined, adminId: string) { const source = await this.repository.findSource(id); if (!source) throw new NotFoundException('Source introuvable.'); if (approved) await this.policy.assertConfigured(source); return this.repository.updateSource(id, { validationStatus: approved ? ScrapedSourceValidationStatus.APPROVED : ScrapedSourceValidationStatus.REJECTED, validationNotes: notes, validatedAt: new Date(), validatedById: adminId, enabled: false, status: ScrapedSourceStatus.INACTIVE }); }
  async updateAuthorization(id: string, input: Record<string, unknown>) { const source = await this.repository.findSource(id); if (!source) throw new NotFoundException('Source introuvable.'); const requestedAuthorizationStatus = input.status as ScrapedAuthorizationStatus; if (requestedAuthorizationStatus === ScrapedAuthorizationStatus.AUTHORIZED) this.assertAuthorizationComplete(input); const { status: _ignored, ...authorizationFields } = input; return this.repository.updateSource(id, { ...authorizationFields, authorizationStatus: requestedAuthorizationStatus, authorizationGrantedAt: input.authorizationGrantedAt ? new Date(String(input.authorizationGrantedAt)) : null, lastPolicyCheckedAt: input.lastPolicyCheckedAt ? new Date(String(input.lastPolicyCheckedAt)) : new Date(), enabled: false, status: ScrapedSourceStatus.INACTIVE }); }
  async activateSource(id: string) { const source = await this.repository.findSource(id); if (!source) throw new NotFoundException('Source introuvable.'); if (source.validationStatus !== ScrapedSourceValidationStatus.APPROVED) throw new ConflictException('La source doit être validée avant activation.'); if (source.authorizationStatus !== ScrapedAuthorizationStatus.AUTHORIZED) throw new ConflictException('Une autorisation valide est requise avant activation.'); this.assertAuthorizationComplete(source); return this.repository.updateSource(id, { enabled: true, status: ScrapedSourceStatus.ACTIVE }); }
  async deactivateSource(id: string) { if (!await this.repository.findSource(id)) throw new NotFoundException('Source introuvable.'); return this.repository.updateSource(id, { enabled: false, status: ScrapedSourceStatus.DISABLED, authorizationStatus: ScrapedAuthorizationStatus.DISABLED }); }
  async testSource(id: string) { const source = await this.repository.findSource(id); if (!source) throw new NotFoundException('Source introuvable.'); await this.policy.assertConfigured(source); const result = await this.registry.for(source).scrape(source); return { sourceId: id, isFixture: source.isFixture, pagesVisited: result.pagesVisited, itemsFound: Math.min(result.machines.length, source.maxItems), sample: result.machines.slice(0, 5) }; }

  async runSource(id: string) {
    const source = await this.repository.findSource(id); if (!source) throw new NotFoundException('Source introuvable.'); if (this.lockedSources.has(id) || await this.repository.hasRunningRun(id)) throw new ConflictException('Cette source est déjà en cours de scraping.');
    this.lockedSources.add(id);
    const run = await this.repository.createRun(id); await this.repository.updateRun(run.id, { status: ScrapeRunStatus.RUNNING, startedAt: new Date() });
    let errors = 0;
    try {
      await this.policy.assertAllowed(source);
      const result = await this.registry.for(source).scrape(source);
      const machines = result.machines.slice(0, source.maxItems);
      let created = 0; let updated = 0; let duplicates = 0;
      for (const rawMachine of machines) { const machine = this.normalizer.normalize(rawMachine); const saved = await this.repository.upsertMachine(source.id, machine); if (saved.action === 'created') created += 1; else if (saved.action === 'updated') updated += 1; else duplicates += 1; await this.delay(source.requestDelayMs); }
      await this.repository.updateRun(run.id, { status: ScrapeRunStatus.SUCCESS, finishedAt: new Date(), pagesVisited: result.pagesVisited, itemsFound: machines.length, itemsCreated: created, itemsUpdated: updated, duplicates, errorCount: 0 });
      await this.repository.updateSource(source.id, { lastScrapedAt: new Date(), nextRunAt: source.isFixture ? null : new Date(Date.now() + 24 * 60 * 60 * 1000) });
      return { runId: run.id, status: ScrapeRunStatus.SUCCESS, pagesVisited: result.pagesVisited, itemsFound: machines.length, itemsCreated: created, itemsUpdated: updated, duplicates };
    } catch (error) {
      errors = 1; await this.repository.createError(run.id, { errorType: error?.constructor?.name || 'ScrapeError', message: error instanceof Error ? error.message : 'Erreur de scraping.' }); await this.repository.updateRun(run.id, { status: ScrapeRunStatus.FAILED, finishedAt: new Date(), errorCount: errors, errorSummary: error instanceof Error ? error.message : 'Erreur de scraping.' }); return { runId: run.id, status: ScrapeRunStatus.FAILED, errorCount: errors };
    } finally { this.lockedSources.delete(id); }
  }

  getRun(id: string) { return this.repository.getRun(id); }
  listRuns(limit: number, skip: number) { return this.repository.listRuns(limit, skip); }
  listErrors(limit: number, skip: number) { return this.repository.listErrors(limit, skip); }
  listMachines(limit: number, skip: number) { return this.repository.listMachines(limit, skip); }
  private validateSourceInput(input: { baseUrl: string; isFixture?: boolean; enabled?: boolean; robotsUrl?: string; termsUrl?: string }) { if (input.isFixture) { if (input.baseUrl !== 'fixture://agricultural-machines') throw new ConflictException('Fixture de scraping inconnue.'); return; } const url = new URL(input.baseUrl); if (!['http:', 'https:'].includes(url.protocol)) throw new ConflictException('Une source réelle doit utiliser HTTP ou HTTPS.'); if (input.enabled && (!input.robotsUrl || !input.termsUrl)) throw new ConflictException('Une source réelle activée doit fournir robots.txt et les conditions d’utilisation.'); }
  private assertAuthorizationComplete(source: Record<string, unknown>) { if (!source.authorizationGrantedAt || !source.authorizationProofRef || source.dataExtractionAuthorized !== true || source.listingReuseAuthorized !== true || !source.maxFrequencySeconds || !source.maxRequests || (source.reuseImages === true && source.imageReuseStatus !== ScrapedImageReuseStatus.AUTHORIZED)) throw new ConflictException('Autorisation incomplète : preuve, droits de données, fréquence, limite de requêtes et droits images requis.'); }
  private delay(milliseconds: number) { return new Promise(resolve => setTimeout(resolve, Math.min(milliseconds, 10000))); }
}
