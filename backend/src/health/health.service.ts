import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async check() {
    let database: 'up' | 'down' = 'up';
    try { await this.prisma.$queryRaw`SELECT 1`; } catch { database = 'down'; }
    return { status: database === 'up' ? 'ok' : 'degraded', environment: this.config.get('NODE_ENV', 'development'), database, timestamp: new Date().toISOString() };
  }

  async readiness() {
    try { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ready', database: 'up', timestamp: new Date().toISOString() }; } catch { throw new ServiceUnavailableException({ status: 'not_ready', database: 'down', timestamp: new Date().toISOString() }); }
  }
}
