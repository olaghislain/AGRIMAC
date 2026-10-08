import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { NormalizedMachine } from '../interfaces/normalized-machine.interface';

@Injectable()
export class MachineNormalizerService {
  normalize(machine: NormalizedMachine): NormalizedMachine & { canonicalKey: string } {
    const clean = (value?: string) => value?.normalize('NFKC').replace(/\s+/g, ' ').trim();
    const brand = clean(machine.brand)?.replace(/[–—]/g, '-') || undefined;
    const model = clean(machine.model)?.replace(/[–—]/g, '-') || undefined;
    const category = clean(machine.category)?.toLowerCase() || undefined;
    const name = clean(machine.name) || 'Machine sans nom';
    const sourceUrl = clean(machine.sourceUrl) || '';
    const canonicalKey = machine.externalId ? `external:${machine.externalId.toLowerCase()}` : createHash('sha256').update(`${brand || ''}|${model || name}|${category || ''}|${sourceUrl}`.toLowerCase()).digest('hex');
    return { ...machine, name, brand, model, category, machineType: clean(machine.machineType), description: clean(machine.description), availability: clean(machine.availability), location: clean(machine.location), sourceUrl, imageUrl: clean(machine.imageUrl), currency: (machine.currency || 'XOF').toUpperCase(), canonicalKey };
  }
}
