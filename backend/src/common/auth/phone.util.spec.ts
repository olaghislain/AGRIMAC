import { BadRequestException } from '@nestjs/common';
import { normalizeBeninPhone } from './phone.util';

describe('normalizeBeninPhone', () => {
  it('normalizes a local ten-digit Benin number', () => {
    expect(normalizeBeninPhone('01 97 12 34 56')).toBe('+2290197123456');
  });

  it('rejects numbers that do not start with 01', () => {
    expect(() => normalizeBeninPhone('97 12 34 56')).toThrow(BadRequestException);
  });
});
