import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../packages/database/src/schema/index';
import { DrizzleBusinessRepository } from '../../../src/core/infrastructure/persistence/drizzle-business.repository';
import { Business } from '../../../src/core/domain/entities/business.entity';

describe('DrizzleBusinessRepository (Integration)', () => {
  let repository: DrizzleBusinessRepository;
  let testDb: ReturnType<typeof drizzle>;
  let pool: Pool;

  const TEST_DATABASE_URL = process.env.DATABASE_URL;

  beforeAll(async () => {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
    testDb = drizzle(pool, { schema });
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE business CASCADE');
    repository = new DrizzleBusinessRepository(testDb as any);
  });

  describe('create', () => {
    it('debe insertar un negocio y devolver la entidad', async () => {
      const business = Business.create({
        name: 'Test Business',
        slug: 'test-business',
        legalName: 'Test Business SA',
        countryCode: 'MX',
        timezone: 'America/Mexico_City',
        currencyCode: 'MXN',
      });

      const saved = await repository.create(business);

      expect(saved).toBeInstanceOf(Business);
      expect(saved.name).toBe('Test Business');
      expect(saved.slug).toBe('test-business');
      expect(saved.legalName).toBe('Test Business SA');
    });

    it('debe insertar negocio con campos opcionales nulos', async () => {
      const business = Business.create({
        name: 'Minimal',
        slug: 'minimal',
      });

      const saved = await repository.create(business);

      expect(saved.name).toBe('Minimal');
      expect(saved.legalName).toBeNull();
      expect(saved.countryCode).toBeNull();
    });
  });

  describe('findById', () => {
    it('debe encontrar un negocio por id', async () => {
      const business = Business.create({
        name: 'Find By Id',
        slug: 'find-by-id',
      });

      await repository.create(business);

      const found = await repository.findById(business.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(business.id);
      expect(found?.name).toBe('Find By Id');
    });

    it('debe retornar null si no existe', async () => {
      const found = await repository.findById('00000000-0000-0000-0000-000000000000');

      expect(found).toBeNull();
    });
  });

  describe('findBySlug', () => {
    it('debe encontrar un negocio por slug', async () => {
      const business = Business.create({
        name: 'Find By Slug',
        slug: 'find-by-slug',
      });

      await repository.create(business);

      const found = await repository.findBySlug('find-by-slug');

      expect(found).not.toBeNull();
      expect(found?.slug).toBe('find-by-slug');
      expect(found?.name).toBe('Find By Slug');
    });

    it('debe retornar null si el slug no existe', async () => {
      const found = await repository.findBySlug('no-existe');

      expect(found).toBeNull();
    });
  });
});