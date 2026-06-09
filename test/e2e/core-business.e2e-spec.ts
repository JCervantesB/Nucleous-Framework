import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('BusinessController (e2e)', () => {
  let app: INestApplication;
  let createdBusinessId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/core/business (POST)', () => {
    it('debe crear un negocio y retornar 201 con id, name, slug', async () => {
      const response = await request(app.getHttpServer())
        .post('/core/business')
        .send({
          name: 'E2E Test Business',
          slug: 'e2e-test-business',
          legalName: 'E2E Test Business SA',
          countryCode: 'MX',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'E2E Test Business');
      expect(response.body).toHaveProperty('slug', 'e2e-test-business');

      createdBusinessId = response.body.id;
    });

    it('debe retornar error cuando el slug ya existe', async () => {
      await request(app.getHttpServer())
        .post('/core/business')
        .send({
          name: 'Otro Negocio',
          slug: 'e2e-test-business',
        })
        .expect(400);
    });
  });

  describe('/core/business/:id (GET)', () => {
    it('debe retornar 200 y el negocio cuando existe', async () => {
      const response = await request(app.getHttpServer())
        .get(`/core/business/${createdBusinessId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdBusinessId);
      expect(response.body).toHaveProperty('name', 'E2E Test Business');
      expect(response.body).toHaveProperty('slug', 'e2e-test-business');
    });

    it('debe retornar error cuando el negocio no existe', async () => {
      await request(app.getHttpServer())
        .get('/core/business/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });
});