import { Injectable, NotFoundException } from '@nestjs/common';
import { ScrapedSource } from '@prisma/client';
import { SourceScraper } from '../interfaces/source-scraper.interface';
import { FixtureMachinesScraper } from './fixture-machines.scraper';
import { HttpMachinesScraper } from './http-machines.scraper';
import { CoinAfriqueBeninScraper } from './coinafrique.scraper';

@Injectable()
export class SourceScraperRegistry {
  private readonly scrapers: SourceScraper[];
  constructor(fixture: FixtureMachinesScraper, http: HttpMachinesScraper, coinafrique: CoinAfriqueBeninScraper) { this.scrapers = [fixture, coinafrique, http]; }
  for(source: ScrapedSource) { const scraper = this.scrapers.find(item => item.supports(source)); if (!scraper) throw new NotFoundException(`Aucun scraper spécifique enregistré pour ${source.baseUrl}.`); return scraper; }
}
