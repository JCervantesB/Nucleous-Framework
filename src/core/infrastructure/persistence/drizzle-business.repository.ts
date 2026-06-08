import { eq } from "drizzle-orm";
import { db } from "../../../db/client.js";
import { business } from "@app/database/schema/core.js";
import { Business, type BusinessProps } from "../../domain/entities/business.entity.js";
import { type BusinessRepository } from "../../domain/repositories/business.repository.js";

export class DrizzleBusinessRepository implements BusinessRepository {
  async create(entity: Business): Promise<Business> {
    await db.insert(business).values({
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
    const rows = await db.select().from(business).where(eq(business.id, id)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findBySlug(slug: string): Promise<Business | null> {
    const rows = await db.select().from(business).where(eq(business.slug, slug)).limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.findById(row.id);
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