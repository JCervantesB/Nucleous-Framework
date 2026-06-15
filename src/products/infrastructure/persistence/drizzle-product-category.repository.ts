import { Injectable, Inject } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '#app/database/client';
import { productCategory, product } from '#app/database/schema/product';
import {
  ProductCategory,
  type ProductCategoryProps,
} from '../../domain/entities/product-category.entity';
import type {
  ProductCategoryRepository,
  ProductCategoryListOptions,
} from '../../domain/repositories/product-category.repository';

@Injectable()
export class DrizzleProductCategoryRepository implements ProductCategoryRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: ProductCategory): Promise<ProductCategory> {
    await this._db.insert(productCategory).values({
      id: entity.id,
      businessId: entity.businessId,
      name: entity.name,
      description: entity.description,
      parentId: entity.parentId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    });
    return entity;
  }

  async findById(
    id: string,
    businessId: string,
  ): Promise<ProductCategory | null> {
    const rows = await this._db
      .select()
      .from(productCategory)
      .where(
        and(
          eq(productCategory.id, id),
          eq(productCategory.businessId, businessId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async list(
    businessId: string,
    options?: ProductCategoryListOptions,
  ): Promise<{ data: ProductCategory[]; total: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    const offset = (page - 1) * pageSize;

    const rows = await this._db
      .select()
      .from(productCategory)
      .where(eq(productCategory.businessId, businessId))
      .offset(offset)
      .limit(pageSize);

    const countResult = await this._db
      .select()
      .from(productCategory)
      .where(eq(productCategory.businessId, businessId));

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: countResult.length,
    };
  }

  async listAsTree(businessId: string): Promise<ProductCategory[]> {
    const rows = await this._db
      .select()
      .from(productCategory)
      .where(
        and(
          eq(productCategory.businessId, businessId),
          eq(productCategory.isActive, true),
        ),
      );
    return rows.map((row) => this.mapToEntity(row));
  }

  async update(entity: ProductCategory): Promise<ProductCategory> {
    await this._db
      .update(productCategory)
      .set({
        name: entity.name,
        description: entity.description,
        parentId: entity.parentId,
        isActive: entity.isActive,
        updatedAt: entity.updatedAt,
      })
      .where(eq(productCategory.id, entity.id));
    return entity;
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this._db
      .update(productCategory)
      .set({ isActive: false })
      .where(
        and(
          eq(productCategory.id, id),
          eq(productCategory.businessId, businessId),
        ),
      );
  }

  async hasChildren(id: string): Promise<boolean> {
    const rows = await this._db
      .select()
      .from(productCategory)
      .where(
        and(
          eq(productCategory.parentId, id),
          eq(productCategory.isActive, true),
        ),
      )
      .limit(1);
    return rows.length > 0;
  }

  async hasProducts(id: string): Promise<boolean> {
    const rows = await this._db
      .select()
      .from(product)
      .where(and(eq(product.categoryId, id), eq(product.isActive, true)))
      .limit(1);
    return rows.length > 0;
  }

  private mapToEntity(
    row: typeof productCategory.$inferSelect,
  ): ProductCategory {
    const props: ProductCategoryProps = {
      id: row.id,
      businessId: row.businessId,
      name: row.name,
      description: row.description,
      parentId: row.parentId,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
    };
    return ProductCategory.fromProps(props);
  }
}
