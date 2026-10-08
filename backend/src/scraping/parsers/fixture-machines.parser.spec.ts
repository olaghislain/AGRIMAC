import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FixtureMachinesParser } from './fixture-machines.parser';

describe('FixtureMachinesParser', () => {
  it('extracts normalized source fields from the local fixture', async () => {
    const html = await readFile(join(process.cwd(), 'src', 'scraping', 'fixtures', 'agricultural-machines.html'), 'utf8');
    const result = new FixtureMachinesParser().parse(html);
    expect(result).toHaveLength(6);
    expect(result[0]).toMatchObject({ externalId: 'fixture-mf-5710', name: 'Tracteur Massey Ferguson 5710 Dyna-4', brand: 'Massey Ferguson', model: '5710 Dyna-4', price: 42500000, currency: 'XOF', availability: 'Disponible à la vente', location: 'Cotonou, Littoral, Bénin', machineType: 'Tracteur agricole à roues' });
    expect(result.map(item => item.category)).toEqual(expect.arrayContaining(['Tracteurs', 'Motoculteurs', 'Machines de récolte', 'Matériel d’irrigation', 'Pulvérisateurs']));
    expect(result.every(item => item.sourceUrl.startsWith('fixture://'))).toBe(true);
  });

  it('ignores cards without a source URL or name', () => {
    expect(new FixtureMachinesParser().parse('<article class="machine-card"><h2 class="machine-name">Sans URL</h2></article>')).toEqual([]);
  });
});
