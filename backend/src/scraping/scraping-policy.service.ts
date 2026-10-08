import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ScrapedAuthorizationStatus, ScrapedSource, ScrapedSourceStatus, ScrapedSourceValidationStatus } from '@prisma/client';

@Injectable()
export class ScrapingPolicyService {
  async assertAllowed(source: ScrapedSource, path = '/') {
    if (source.status !== ScrapedSourceStatus.ACTIVE || !source.enabled) throw new ForbiddenException('La source de scraping est inactive.');
    if (source.validationStatus !== ScrapedSourceValidationStatus.APPROVED) throw new ForbiddenException('La source de scraping n’est pas validée.');
    if (source.authorizationStatus !== ScrapedAuthorizationStatus.AUTHORIZED) throw new ForbiddenException('La source ne possède pas une autorisation valide.');
    await this.assertConfigured(source, path);
  }

  async assertConfigured(source: ScrapedSource, path = '/') {
    if (source.isFixture) { if (source.baseUrl !== 'fixture://agricultural-machines') throw new BadRequestException('Fixture de scraping inconnue.'); return; }
    let url: URL;
    try { url = new URL(source.baseUrl); } catch { throw new BadRequestException('URL de source invalide.'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new BadRequestException('Seules les sources HTTP(S) sont autorisées.');
    if (!source.robotsUrl || !source.termsUrl) throw new ForbiddenException('Robots.txt et conditions d’utilisation requis avant activation.');
    let terms: URL;
    try { terms = new URL(source.termsUrl); } catch { throw new ForbiddenException('URL des conditions d’utilisation invalide.'); }
    if (![url.protocol].includes(terms.protocol) || !['http:', 'https:'].includes(terms.protocol)) throw new ForbiddenException('Les conditions d’utilisation doivent être accessibles en HTTP(S).');
    // No network request is made here. An administrator records the reviewed
    // robots/terms URLs and evidence; a future approved source adapter may
    // perform a controlled policy check before its first authorized run.
    void path;
  }
}
