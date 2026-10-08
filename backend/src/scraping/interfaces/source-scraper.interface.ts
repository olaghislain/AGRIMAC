import { ScrapedSource } from '@prisma/client';
import { NormalizedMachine } from './normalized-machine.interface';

export interface SourceScraper {
  supports(source: ScrapedSource): boolean;
  scrape(source: ScrapedSource): Promise<{ pagesVisited: number; machines: NormalizedMachine[] }>;
}
