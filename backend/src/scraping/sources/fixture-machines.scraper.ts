import { Injectable } from '@nestjs/common';
import { ScrapedSource } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FixtureMachinesParser } from '../parsers/fixture-machines.parser';
import { NormalizedMachine } from '../interfaces/normalized-machine.interface';
import { SourceScraper } from '../interfaces/source-scraper.interface';

@Injectable()
export class FixtureMachinesScraper implements SourceScraper {
  constructor(private readonly parser: FixtureMachinesParser) {}
  supports(source: ScrapedSource) { return source.isFixture && source.baseUrl === 'fixture://agricultural-machines'; }
  async scrape(_source: ScrapedSource): Promise<{ pagesVisited: number; machines: NormalizedMachine[] }> {
    const candidates = [join(process.cwd(), 'src', 'scraping', 'fixtures', 'agricultural-machines.html'), join(process.cwd(), 'dist', 'scraping', 'fixtures', 'agricultural-machines.html')];
    let html = '';
    for (const path of candidates) { try { html = await readFile(path, 'utf8'); break; } catch { /* try the next packaged location */ } }
    if (!html) throw new Error('Fixture agricole introuvable.');
    return { pagesVisited: 1, machines: this.parser.parse(html) };
  }
}
