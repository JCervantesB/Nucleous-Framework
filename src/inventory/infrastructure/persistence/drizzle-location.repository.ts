import { Injectable, Inject } from '@nestjs/common';
import { eq, and, like, or } from 'drizzle-orm';
import { db } from '#app/database/client';
import { inventoryLocation } from '#app/database/schema/inventory';
import {
  InventoryLocation,
  type InventoryLocationProps,
  type LocationType,
} from '../../domain/entities/inventory-location.entity';
import type {
  InventoryLocationRepository,
  LocationListOptions,
} from '../../domain/repositories/inventory-location.repository';

@Injectable()
export class DrizzleLocationRepository implements InventoryLocationRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: InventoryLocation): Promise<InventoryLocation> {
    await this._db.insert(inventoryLocation).values({
      id: entity.id,
      businessId: entity.businessId,
      code: entity.code,
      name: entity.name,
      type: entity.type,
      contactId: entity.contactId,
      address: entity.address,
      isActive: entity.isActive,
      isTransit: entity.isTransit,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async findById(
    id: string,
    businessId: string,
  ): Promise<InventoryLocation | null> {
    const rows = await this._db
      .select()
      .from(inventoryLocation)
      .where(
        and(
          eq(inventoryLocation.id, id),
          eq(inventoryLocation.businessId, businessId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findByCode(
    code: string,
    businessId: string,
  ): Promise<InventoryLocation | null> {
    const rows = await this._db
      .select()
      .from(inventoryLocation)
      .where(
        and(
          eq(inventoryLocation.code, code),
          eq(inventoryLocation.businessId, businessId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async list(
    businessId: string,
    options?: LocationListOptions,
  ): Promise<{ data: InventoryLocation[]; total: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(inventoryLocation.businessId, businessId)];

    if (options?.type) {
      conditions.push(eq(inventoryLocation.type, options.type));
    }

    if (options?.isActive !== undefined) {
      conditions.push(eq(inventoryLocation.isActive, options.isActive));
    }

    if (options?.search) {
      const searchPattern = `%${options.search}%`;
      conditions.push(
        or(
          like(inventoryLocation.code, searchPattern),
          like(inventoryLocation.name, searchPattern),
        )!,
      );
    }

    const rows = await this._db
      .select()
      .from(inventoryLocation)
      .where(and(...conditions))
      .offset(offset)
      .limit(pageSize);

    const countResult = await this._db
      .select()
      .from(inventoryLocation)
      .where(eq(inventoryLocation.businessId, businessId));

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: countResult.length,
    };
  }

  async update(entity: InventoryLocation): Promise<InventoryLocation> {
    await this._db
      .update(inventoryLocation)
      .set({
        code: entity.code,
        name: entity.name,
        type: entity.type,
        contactId: entity.contactId,
        address: entity.address,
        isActive: entity.isActive,
        isTransit: entity.isTransit,
        updatedAt: entity.updatedAt,
        updatedBy: entity.updatedBy,
      })
      .where(eq(inventoryLocation.id, entity.id));
    return entity;
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this._db
      .update(inventoryLocation)
      .set({ isActive: false })
      .where(
        and(
          eq(inventoryLocation.id, id),
          eq(inventoryLocation.businessId, businessId),
        ),
      );
  }

  private mapToEntity(
    row: typeof inventoryLocation.$inferSelect,
  ): InventoryLocation {
    const props: InventoryLocationProps = {
      id: row.id,
      businessId: row.businessId,
      code: row.code,
      name: row.name,
      type: row.type as LocationType,
      contactId: row.contactId,
      address: row.address,
      isActive: row.isActive,
      isTransit: row.isTransit,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
    return InventoryLocation.fromProps(props);
  }
}
