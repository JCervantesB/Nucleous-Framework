import { Injectable, Inject } from '@nestjs/common';
import { eq, and, like, or } from 'drizzle-orm';
import { db } from '#app/database/client';
import { product } from '#app/database/schema/product';
import { Product, type ProductProps, type ProductType } from '../../domain/entities/product.entity';
import type { ProductRepository, ProductListOptions } from '../../domain/repositories/product.repository';

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: Product): Promise<Product> {
    await this._db.insert(product).values({
      id: entity.id,
      businessId: entity.businessId,
      sku: entity.sku,
      name: entity.name,
      description: entity.description,
      type: entity.type,
      categoryId: entity.categoryId,
      basePrice: entity.basePrice.toString(),
      currencyCode: entity.currencyCode,
      isActive: entity.isActive,
      trackInventory: entity.trackInventory,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async findById(id: string, businessId: string): Promise<Product | null> {
    const rows = await this._db
      .select()
      .from(product)
      .where(and(eq(product.id, id), eq(product.businessId, businessId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findBySku(sku: string, businessId: string): Promise<Product | null> {
    const rows = await this._db
      .select()
      .from(product)
      .where(and(eq(product.sku, sku), eq(product.businessId, businessId)))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async list(businessId: string, options?: ProductListOptions): Promise<{ data: Product[]; total: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    let query = this._db.select().from(product).where(eq(product.businessId, businessId));

    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      query = this._db
        .select()
        .from(product)
        .where(
          and(
            eq(product.businessId, businessId),
            or(
              like(product.name, searchPattern),
              like(product.sku, searchPattern)
            )
          )
        );
    }

    const rows = await query.offset(offset).limit(pageSize);
    const countResult = await this._db
      .select()
      .from(product)
      .where(eq(product.businessId, businessId));

    return {
      data: rows.map(row => this.mapToEntity(row)),
      total: countResult.length,
    };
  }

  async update(entity: Product): Promise<Product> {
    await this._db
      .update(product)
      .set({
        name: entity.name,
        description: entity.description,
        type: entity.type,
        categoryId: entity.categoryId,
        basePrice: entity.basePrice.toString(),
        currencyCode: entity.currencyCode,
        isActive: entity.isActive,
        trackInventory: entity.trackInventory,
        updatedAt: entity.updatedAt,
        updatedBy: entity.updatedBy,
      })
      .where(eq(product.id, entity.id));
    return entity;
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this._db
      .update(product)
      .set({ isActive: false })
      .where(and(eq(product.id, id), eq(product.businessId, businessId)));
  }

  private mapToEntity(row: typeof product.$inferSelect): Product {
    const props: ProductProps = {
      id: row.id,
      businessId: row.businessId,
      sku: row.sku,
      name: row.name,
      description: row.description,
      type: row.type as ProductType,
      categoryId: row.categoryId,
      basePrice: parseFloat(row.basePrice),
      currencyCode: row.currencyCode,
      isActive: row.isActive,
      trackInventory: row.trackInventory,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
    return Product.fromProps(props);
  }
}
