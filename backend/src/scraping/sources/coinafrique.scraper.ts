import { ForbiddenException, Injectable } from '@nestjs/common';
import { ScrapedSource } from '@prisma/client';
import { NormalizedMachine } from '../interfaces/normalized-machine.interface';
import { SourceScraper } from '../interfaces/source-scraper.interface';
import { CoinAfriqueBeninParser } from '../parsers/coinafrique.parser';

export const COINAFRIQUE_BENIN_BASE_URL = 'https://bj.coinafrique.com/categorie/materiel-agricole';
export const COINAFRIQUE_BENIN_ROBOTS_URL = 'https://bj.coinafrique.com/robots.txt';
export const COINAFRIQUE_BENIN_TERMS_URL = 'https://bj.coinafrique.com/tu';
export const COINAFRIQUE_BENIN_SITEMAP_URL = 'https://bj.coinafrique.com/sitemaps.xml';

@Injectable()
export class CoinAfriqueBeninScraper implements SourceScraper {
  constructor(private readonly parser: CoinAfriqueBeninParser) {}

  supports(source: ScrapedSource) { return !source.isFixture && source.baseUrl === COINAFRIQUE_BENIN_BASE_URL; }

  buildListingUrl(page = 1) { return page <= 1 ? COINAFRIQUE_BENIN_BASE_URL : `${COINAFRIQUE_BENIN_BASE_URL}?page=${page}`; }

  parseAuthorizedListing(html: string, pageUrl = COINAFRIQUE_BENIN_BASE_URL) { return this.parser.parse(html, pageUrl); }

  async scrape(_source: ScrapedSource): Promise<{ pagesVisited: number; machines: NormalizedMachine[] }> {
    throw new ForbiddenException('CoinAfrique Bénin est préparé mais bloqué : autorisation écrite requise avant toute requête.');
  }
}
