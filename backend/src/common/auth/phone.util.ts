import { BadRequestException } from '@nestjs/common';

export function normalizeBeninPhone(phone: string): string {
  const compact = phone.replace(/\s|[-().]/g, '');
  if (/^01\d{8}$/.test(compact)) return `+229${compact}`;
  if (/^\+22901\d{8}$/.test(compact)) return compact;
  throw new BadRequestException('Le numéro doit contenir 10 chiffres et commencer par 01.');
}
