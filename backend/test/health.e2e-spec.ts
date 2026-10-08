import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AGRIMAC health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('exposes liveness and readiness endpoints', async () => {
    await request(app.getHttpServer()).get('/health/live').expect(200).expect(response => expect(response.body.status).toBe('alive'));
    await request(app.getHttpServer()).get('/health/ready').expect(200).expect(response => expect(response.body.status).toBe('ready'));
  });
});
