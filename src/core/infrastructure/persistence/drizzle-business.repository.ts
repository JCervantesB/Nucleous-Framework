import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '#app/database/client.js';
import { business } from '#app/database/schema/core.js';
import {
  Business,
  type BusinessProps,
} from '../../domain/entities/business.entity.js';
import type { BusinessRepository } from '../../domain/repositories/business.repository.js';

@Injectable()
export class DrizzleBusinessRepository implements BusinessRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: Business): Promise<Business> {
    await this._db.insert(business).values({
      id: entity.id,
      name: entity.name,
      legalName: entity.legalName,
      slug: entity.slug,
      countryCode: entity.countryCode,
      timezone: entity.timezone,
      currencyCode: entity.currencyCode,
      publicName: entity.publicName,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async findById(id: string): Promise<Business | null> {
    const rows = await this._db
      .select()
      .from(business)
      .where(eq(business.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findBySlug(slug: string): Promise<Business | null> {
    const rows = await this._db
      .select()
      .from(business)
      .where(eq(business.slug, slug))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  private mapToEntity(row: typeof business.$inferSelect): Business {
    const props: BusinessProps = {
      id: row.id,
      name: row.name,
      legalName: row.legalName,
      slug: row.slug,
      countryCode: row.countryCode,
      timezone: row.timezone,
      currencyCode: row.currencyCode,
      publicName: row.publicName,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
    };
    return Business.fromProps(props);
  }
}
