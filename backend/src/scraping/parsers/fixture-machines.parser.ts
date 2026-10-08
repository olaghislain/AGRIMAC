import * as cheerio from 'cheerio';
import { NormalizedMachine } from '../interfaces/normalized-machine.interface';
import { MachineParser } from '../interfaces/machine-parser.interface';

export class FixtureMachinesParser implements MachineParser {
  parse(html: string): NormalizedMachine[] {
    const $ = cheerio.load(html);
    return $('.machine-card').map((_index, element) => {
      const card = $(element);
      const specs: Record<string, string> = {};
      card.find('.specs li').each((_specIndex, spec) => { const key = $(spec).attr('data-key'); if (key) specs[key] = this.clean($(spec).text()); });
      const sourceUrl = card.find('.machine-link').attr('href');
      const imageUrl = card.find('.machine-image').attr('src');
      return {
        externalId: card.attr('data-external-id') || undefined,
        sourceUrl: sourceUrl || '',
        name: this.clean(card.find('.machine-name').first().text()),
        brand: this.clean(card.find('.brand').first().text()),
        model: this.clean(card.find('.model').first().text()),
        category: this.clean(card.find('.category').first().text()),
        machineType: this.clean(card.find('.machine-type').first().text()),
        description: this.clean(card.find('.description').first().text()),
        technicalSpecs: specs,
        price: this.parsePrice(card.find('.price').first().text()),
        currency: 'XOF',
        availability: this.clean(card.find('.availability').first().text()),
        location: this.clean(card.find('.location').first().text()),
        imageUrl: imageUrl || undefined,
      };
    }).get().filter(item => item.name && item.sourceUrl);
  }

  private clean(value: string) { return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
  private parsePrice(value: string) { const digits = value.replace(/[^0-9]/g, ''); return digits ? Number(digits) : undefined; }
}
