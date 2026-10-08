import { Injectable, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class ScrapingHttpService {
  async get(url: string, timeoutMs: number, retries = 2) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(url, { headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'AGRIMAC-PublicDataCrawler/1.0 (+admin-configured-source)' }, signal: AbortSignal.timeout(timeoutMs) });
        if (response.status === 403 || response.status === 429) throw new ServiceUnavailableException(`Source refusée (${response.status}).`);
        if (!response.ok) throw new ServiceUnavailableException(`Source indisponible (${response.status}).`);
        return await response.text();
      } catch (error) { lastError = error; if (attempt < retries) await new Promise(resolve => setTimeout(resolve, 250 * 2 ** attempt)); }
    }
    throw lastError instanceof Error ? lastError : new ServiceUnavailableException('Source inaccessible.');
  }
}
