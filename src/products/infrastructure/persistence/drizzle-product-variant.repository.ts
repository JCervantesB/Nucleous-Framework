import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '#app/database/client';
import { productVariant } from '#app/database/schema/product';
import { ProductVariant, type ProductVariantProps } from '../../domain/entities/product-variant.entity';
import type { ProductVariantRepository } from '../../domain/repositories/product-variant.repository';

@Injectable()
export class DrizzleProductVariantRepository implements ProductVariantRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: ProductVariant): Promise<ProductVariant> {
    await this._db.insert(productVariant).values({
      id: entity.id,
      productId: entity.productId,
      sku: entity.sku,
      name: entity.name,
      priceModifier: entity.priceModifier.toString(),
      attributes: entity.attributes,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async findById(id: string, productId: string): Promise<ProductVariant | null> {
    const rows = await this._db
      .select()
      .from(productVariant)
      .where(and(eq(productVariant.id, id), eq(productVariant.productId, productId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findBySku(sku: string, productId: string): Promise<ProductVariant | null> {
    const rows = await this._db
      .select()
      .from(productVariant)
      .where(and(eq(productVariant.sku, sku), eq(productVariant.productId, productId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async listByProduct(productId: string): Promise<ProductVariant[]> {
    const rows = await this._db
      .select()
      .from(productVariant)
      .where(eq(productVariant.productId, productId));
    return rows.map(row => this.mapToEntity(row));
  }

  async update(entity: ProductVariant): Promise<ProductVariant> {
    await this._db
      .update(productVariant)
      .set({
        name: entity.name,
        priceModifier: entity.priceModifier.toString(),
        attributes: entity.attributes,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt,
      })
      .where(eq(productVariant.id, entity.id));
    return entity;
  }

  async delete(id: string, productId: string): Promise<void> {
    await this._db
      .update(productVariant)
      .set({ isActive: false })
      .where(and(eq(productVariant.id, id), eq(productVariant.productId, productId)));
  }

  private mapToEntity(row: typeof productVariant.$inferSelect): ProductVariant {
    const props: ProductVariantProps = {
      id: row.id,
      productId: row.productId,
      sku: row.sku,
      name: row.name,
      priceModifier: parseFloat(row.priceModifier),
      attributes: row.attributes as Record<string, string>,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
    };
    return ProductVariant.fromProps(props);
  }
}
