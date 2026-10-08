import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ScrapingRepository } from './scraping.repository';
import { ScrapingService } from './scraping.service';

@Injectable()
export class ScrapingScheduler {
  private readonly logger = new Logger(ScrapingScheduler.name);
  constructor(private readonly config: ConfigService, private readonly repository: ScrapingRepository, private readonly scraping: ScrapingService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDaily() {
    if (this.config.get('SCRAPING_SCHEDULER_ENABLED', 'false') !== 'true') return;
    for (const source of await this.repository.activeSources()) { try { await this.scraping.runSource(source.id); } catch (error) { this.logger.error(`Scraping source ${source.id} failed: ${error instanceof Error ? error.message : 'unknown error'}`); } }
  }
}
