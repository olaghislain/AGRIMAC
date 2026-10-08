import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private requests = 0;
  private failures = 0;
  private totalDurationMs = 0;

  request(durationMs: number, failed: boolean) {
    this.requests += 1;
    this.totalDurationMs += durationMs;
    if (failed) this.failures += 1;
  }

  increment(name: string, amount = 1) { this.counters.set(name, (this.counters.get(name) || 0) + amount); }

  snapshot() { return { requests: this.requests, failures: this.failures, averageDurationMs: this.requests ? Number((this.totalDurationMs / this.requests).toFixed(2)) : 0, counters: Object.fromEntries(this.counters) }; }

  prometheus() {
    const lines = ['# HELP agrimac_http_requests_total Total HTTP requests', '# TYPE agrimac_http_requests_total counter', `agrimac_http_requests_total ${this.requests}`, '# HELP agrimac_http_failures_total Total failed HTTP requests', '# TYPE agrimac_http_failures_total counter', `agrimac_http_failures_total ${this.failures}`, '# HELP agrimac_http_request_duration_ms_total Cumulative HTTP request duration in milliseconds', '# TYPE agrimac_http_request_duration_ms_total counter', `agrimac_http_request_duration_ms_total ${this.totalDurationMs}`];
    for (const [name, value] of this.counters) lines.push(`agrimac_${name}_total ${value}`);
    return `${lines.join('\n')}\n`;
  }
}
