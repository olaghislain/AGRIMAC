import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AGRIMAC API contract (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('protects phase 7 to 9 resources and exposes operational endpoints', async () => {
    await request(app.getHttpServer()).get('/conversations').expect(401);
    await request(app.getHttpServer()).get('/notifications').expect(401);
    await request(app.getHttpServer()).get('/uploads/not-a-uuid').expect(401);
    await request(app.getHttpServer()).get('/payments').expect(401);
    await request(app.getHttpServer()).get('/admin/scraping/sources').expect(401);
    await request(app.getHttpServer()).get('/health/metrics').expect(200).expect(response => expect(response.text).toContain('agrimac_http_requests_total'));
  });
});
