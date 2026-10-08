import { ForbiddenException } from '@nestjs/common';
import { CoinAfriqueBeninScraper, COINAFRIQUE_BENIN_BASE_URL } from './coinafrique.scraper';

describe('CoinAfriqueBeninScraper', () => {
  it('builds the observed category pagination without making a request', () => {
    const parser = { parse: jest.fn() };
    const scraper = new CoinAfriqueBeninScraper(parser as never);
    expect(scraper.supports({ isFixture: false, baseUrl: COINAFRIQUE_BENIN_BASE_URL } as never)).toBe(true);
    expect(scraper.buildListingUrl(1)).toBe(COINAFRIQUE_BENIN_BASE_URL);
    expect(scraper.buildListingUrl(2)).toBe(`${COINAFRIQUE_BENIN_BASE_URL}?page=2`);
    expect(parser.parse).not.toHaveBeenCalled();
  });

  it('blocks real execution until written authorization exists', async () => {
    const scraper = new CoinAfriqueBeninScraper({} as never);
    await expect(scraper.scrape({} as never)).rejects.toBeInstanceOf(ForbiddenException);
  });
});
