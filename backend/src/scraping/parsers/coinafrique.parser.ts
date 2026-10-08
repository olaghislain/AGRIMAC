import * as cheerio from 'cheerio';
import { NormalizedMachine } from '../interfaces/normalized-machine.interface';
import { MachineParser } from '../interfaces/machine-parser.interface';

/**
 * Parser for the verified CoinAfrique Bénin category-card contract.
 * It intentionally does not infer detail-page fields that are absent from
 * the category markup, and it does not return image URLs before reuse rights
 * are approved.
 */
export class CoinAfriqueBeninParser implements MachineParser {
  parse(html: string, pageUrl = 'https://bj.coinafrique.com/categorie/materiel-agricole'): NormalizedMachine[] {
    const $ = cheerio.load(html);
    const category = this.clean($('#gtm-category').attr('value')) || this.clean($('.breadcrumb-box.cat-page .breadcrumb').last().text()) || undefined;
    return $('.adcard__listing[data-view-origin="sub-category-page-listing"] .card.ad__card.round.small.hoverable').map((_index, element) => {
      const card = $(element);
      const titleLink = card.find('.ad__card-description > a').first();
      const priceLink = card.find('.ad__card-price > a').first();
      const image = card.find('.ad__card-image > img.ad__card-img').first();
      const favorite = card.find('.card-fav').first();
      const sourceUrl = this.absoluteUrl(titleLink.attr('href'), pageUrl);
      const externalId = this.clean(favorite.attr('data-post-id')) || this.idFromAnnouncementUrl(sourceUrl);
      const priceText = this.clean(priceLink.text());
      return {
        externalId,
        sourceUrl: sourceUrl || pageUrl,
        name: this.clean(titleLink.text()) || '',
        brand: undefined,
        model: undefined,
        category: this.clean(favorite.attr('data-ad-category')) || category,
        machineType: undefined,
        description: undefined,
        technicalSpecs: undefined,
        price: this.parsePrice(priceText),
        currency: 'XOF',
        availability: undefined,
        location: this.clean(card.find('.ad__card-location > span').first().text()),
        // Image reuse is not authorized; keep no reusable URL in the normalized record.
        imageUrl: undefined,
        sourceImageReference: this.clean(image.attr('src')) || undefined,
        publishedAge: this.clean(card.find('.ad__card-timesince').first().text()) || undefined,
      } as NormalizedMachine & { sourceImageReference?: string; publishedAge?: string };
    }).get().filter(machine => machine.name && machine.sourceUrl);
  }

  private clean(value?: string) { return value?.replace(/\s+/g, ' ').trim(); }
  private absoluteUrl(value: string | undefined, pageUrl: string) { if (!value) return undefined; try { return new URL(value, pageUrl).toString(); } catch { return undefined; } }
  private idFromAnnouncementUrl(value?: string) { const match = value?.match(/-(\d+)(?:\?|$)/); return match?.[1]; }
  private parsePrice(value?: string) { if (!value || /prix sur demande/i.test(value)) return undefined; const digits = value.replace(/[^0-9]/g, ''); return digits ? Number(digits) : undefined; }
}
