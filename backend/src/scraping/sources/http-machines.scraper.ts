import { Injectable, NotImplementedException } from '@nestjs/common';
import { ScrapedSource } from '@prisma/client';
import { NormalizedMachine } from '../interfaces/normalized-machine.interface';
import { SourceScraper } from '../interfaces/source-scraper.interface';

@Injectable()
export class HttpMachinesScraper implements SourceScraper {
  supports(source: ScrapedSource) { return !source.isFixture && /^https?:\/\//i.test(source.baseUrl); }
  async scrape(source: ScrapedSource): Promise<{ pagesVisited: number; machines: NormalizedMachine[] }> {
    void source;
    throw new NotImplementedException('Aucun scraper externe spécifique n’est activé. Ajoutez un scraper et un parser dédiés après autorisation écrite.');
  }
}
