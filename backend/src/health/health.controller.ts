import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { MetricsService } from '../common/metrics/metrics.service';
import type { Response } from 'express';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService, private readonly metrics: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Check application and database status' })
  @ApiResponse({ status: 200, description: 'Backend health status' })
  check() { return this.health.check(); }

  @Get('live') live() { return { status: 'alive', timestamp: new Date().toISOString() }; }

  @Get('ready') ready() { return this.health.readiness(); }

  @Get('metrics') metricsEndpoint(@Res() response: Response) { response.type('text/plain').send(this.metrics.prometheus()); }
}
