import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MetricsInterceptor } from './common/metrics/metrics.interceptor';
import { StructuredLogger } from './common/logging/structured.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true, logger: new StructuredLogger() });
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const apiPrefix = config.get<string>('API_PREFIX', 'api/v1');
  const origins = config.get<string>('FRONTEND_ORIGINS', 'http://localhost:5175').split(',').map(value => value.trim()).filter(Boolean);

  app.enableCors({ origin: origins, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(app.get(MetricsInterceptor));

  const swaggerConfig = new DocumentBuilder().setTitle('AGRIMAC API').setDescription('AGRIMAC backend foundation API').setVersion('0.1.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  app.setGlobalPrefix(apiPrefix, { exclude: ['health', 'health/live', 'health/ready', 'health/metrics'] });
  await app.listen(port, '0.0.0.0');
  console.log(`AGRIMAC backend listening on http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
