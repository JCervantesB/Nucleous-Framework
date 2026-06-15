import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '#app/database/client';
import { productUnitMeasure } from '#app/database/schema/product';
import { ProductUnitMeasure, type ProductUnitMeasureProps, type UnitType } from '../../domain/entities/product-unit-measure.entity';
import type { ProductUnitMeasureRepository } from '../../domain/repositories/product-unit-measure.repository';

@Injectable()
export class DrizzleProductUnitMeasureRepository implements ProductUnitMeasureRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: ProductUnitMeasure): Promise<ProductUnitMeasure> {
    await this._db.insert(productUnitMeasure).values({
      id: entity.id,
      businessId: entity.businessId,
      name: entity.name,
      abbreviation: entity.abbreviation,
      type: entity.type,
      conversionFactor: entity.conversionFactor.toString(),
      isDefault: entity.isDefault,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async findById(id: string, businessId: string): Promise<ProductUnitMeasure | null> {
    const rows = await this._db
      .select()
      .from(productUnitMeasure)
      .where(and(eq(productUnitMeasure.id, id), eq(productUnitMeasure.businessId, businessId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async list(businessId: string): Promise<ProductUnitMeasure[]> {
    const rows = await this._db
      .select()
      .from(productUnitMeasure)
      .where(eq(productUnitMeasure.businessId, businessId));
    return rows.map(row => this.mapToEntity(row));
  }

  async update(entity: ProductUnitMeasure): Promise<ProductUnitMeasure> {
    await this._db
      .update(productUnitMeasure)
      .set({
        name: entity.name,
        abbreviation: entity.abbreviation,
        type: entity.type,
        conversionFactor: entity.conversionFactor.toString(),
        isDefault: entity.isDefault,
        updatedAt: entity.updatedAt,
      })
      .where(eq(productUnitMeasure.id, entity.id));
    return entity;
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this._db
      .delete(productUnitMeasure)
      .where(and(eq(productUnitMeasure.id, id), eq(productUnitMeasure.businessId, businessId)));
  }

  async getDefault(businessId: string): Promise<ProductUnitMeasure | null> {
    const rows = await this._db
      .select()
      .from(productUnitMeasure)
      .where(and(eq(productUnitMeasure.businessId, businessId), eq(productUnitMeasure.isDefault, true)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  private mapToEntity(row: typeof productUnitMeasure.$inferSelect): ProductUnitMeasure {
    const props: ProductUnitMeasureProps = {
      id: row.id,
      businessId: row.businessId,
      name: row.name,
      abbreviation: row.abbreviation,
      type: row.type as UnitType,
      conversionFactor: parseFloat(row.conversionFactor),
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
    };
    return ProductUnitMeasure.fromProps(props);
  }
}
