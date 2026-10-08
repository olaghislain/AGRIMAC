import { MachineNormalizerService } from './machine-normalizer.service';

describe('MachineNormalizerService', () => {
  it('cleans labels and creates a stable canonical key', () => {
    const service = new MachineNormalizerService();
    const first = service.normalize({ name: ' Massey   Ferguson 5710 ', brand: 'Massey Ferguson', model: '5710', category: ' Tracteur agricole ', sourceUrl: 'https://source.test/mf-5710', currency: 'xof' });
    const second = service.normalize({ name: 'Massey Ferguson - 5710', brand: 'Massey Ferguson', model: '5710', category: 'Tracteur agricole', sourceUrl: 'https://source.test/mf-5710', currency: 'XOF' });
    expect(first.name).toBe('Massey Ferguson 5710');
    expect(first.category).toBe('tracteur agricole');
    expect(first.currency).toBe('XOF');
    expect(first.canonicalKey).toBe(second.canonicalKey);
  });
});
