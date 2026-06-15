import { Injectable, Inject } from '@nestjs/common';
import { eq, and, like, sql, isNull } from 'drizzle-orm';
import { db } from '#app/database/client';
import { inventoryMove } from '#app/database/schema/inventory';
import {
  InventoryMove,
  type InventoryMoveProps,
  type MoveType,
  type MoveState,
} from '../../domain/entities/inventory-move.entity';
import type {
  InventoryMoveRepository,
  MoveListOptions,
} from '../../domain/repositories/inventory-move.repository';

@Injectable()
export class DrizzleMoveRepository implements InventoryMoveRepository {
  constructor(@Inject('DB') private readonly _db: typeof db) {}

  async create(entity: InventoryMove): Promise<InventoryMove> {
    await this._db.insert(inventoryMove).values({
      id: entity.id,
      businessId: entity.businessId,
      productId: entity.productId,
      variantId: entity.variantId,
      moveType: entity.moveType,
      state: entity.state,
      fromLocationId: entity.fromLocationId,
      toLocationId: entity.toLocationId,
      quantity: entity.quantity,
      unitOfMeasureId: entity.unitOfMeasureId,
      reference: entity.reference,
      notes: entity.notes,
      externalId: entity.externalId,
      originTable: entity.originTable,
      originId: entity.originId,
      confirmedAt: entity.confirmedAt,
      doneAt: entity.doneAt,
      cancelledAt: entity.cancelledAt,
      createdAt: entity.createdAt,
      createdBy: entity.createdBy,
    });
    return entity;
  }

  async findById(
    id: string,
    businessId: string,
  ): Promise<InventoryMove | null> {
    const rows = await this._db
      .select()
      .from(inventoryMove)
      .where(
        and(eq(inventoryMove.id, id), eq(inventoryMove.businessId, businessId)),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findByExternalId(
    externalId: string,
    businessId: string,
  ): Promise<InventoryMove | null> {
    const rows = await this._db
      .select()
      .from(inventoryMove)
      .where(
        and(
          eq(inventoryMove.externalId, externalId),
          eq(inventoryMove.businessId, businessId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async list(
    businessId: string,
    options?: MoveListOptions,
  ): Promise<{ data: InventoryMove[]; total: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const conditions = [eq(inventoryMove.businessId, businessId)];

    if (options?.productId) {
      conditions.push(eq(inventoryMove.productId, options.productId));
    }

    if (options?.variantId) {
      conditions.push(eq(inventoryMove.variantId, options.variantId));
    }

    if (options?.moveType) {
      conditions.push(eq(inventoryMove.moveType, options.moveType));
    }

    if (options?.state) {
      conditions.push(eq(inventoryMove.state, options.state));
    }

    if (options?.fromLocationId) {
      conditions.push(eq(inventoryMove.fromLocationId, options.fromLocationId));
    }

    if (options?.toLocationId) {
      conditions.push(eq(inventoryMove.toLocationId, options.toLocationId));
    }

    if (options?.reference) {
      conditions.push(like(inventoryMove.reference, `%${options.reference}%`));
    }

    const rows = await this._db
      .select()
      .from(inventoryMove)
      .where(and(...conditions))
      .offset(offset)
      .limit(pageSize);

    const countResult = await this._db
      .select()
      .from(inventoryMove)
      .where(eq(inventoryMove.businessId, businessId));

    return {
      data: rows.map((row) => this.mapToEntity(row)),
      total: countResult.length,
    };
  }

  async listByProduct(
    productId: string,
    businessId: string,
  ): Promise<InventoryMove[]> {
    const rows = await this._db
      .select()
      .from(inventoryMove)
      .where(
        and(
          eq(inventoryMove.productId, productId),
          eq(inventoryMove.businessId, businessId),
        ),
      );
    return rows.map((row) => this.mapToEntity(row));
  }

  async update(entity: InventoryMove): Promise<InventoryMove> {
    await this._db
      .update(inventoryMove)
      .set({
        state: entity.state,
        fromLocationId: entity.fromLocationId,
        toLocationId: entity.toLocationId,
        quantity: entity.quantity,
        notes: entity.notes,
        confirmedAt: entity.confirmedAt,
        doneAt: entity.doneAt,
        cancelledAt: entity.cancelledAt,
        updatedAt: entity.updatedAt,
        updatedBy: entity.updatedBy,
      })
      .where(eq(inventoryMove.id, entity.id));
    return entity;
  }

  async delete(id: string, businessId: string): Promise<void> {
    await this._db
      .update(inventoryMove)
      .set({ state: 'CANCELLED' })
      .where(
        and(eq(inventoryMove.id, id), eq(inventoryMove.businessId, businessId)),
      );
  }

  async sumQuantity(
    productId: string,
    variantId: string | null,
    locationId: string,
    businessId: string,
  ): Promise<string> {
    const variantCondition = variantId
      ? eq(inventoryMove.variantId, variantId)
      : isNull(inventoryMove.variantId);

    const inboundResult = await this._db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${inventoryMove.quantity} AS NUMERIC)), 0)`,
      })
      .from(inventoryMove)
      .where(
        and(
          eq(inventoryMove.productId, productId),
          variantCondition,
          eq(inventoryMove.toLocationId, locationId),
          eq(inventoryMove.businessId, businessId),
          eq(inventoryMove.state, 'DONE'),
        ),
      );

    const outboundResult = await this._db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${inventoryMove.quantity} AS NUMERIC)), 0)`,
      })
      .from(inventoryMove)
      .where(
        and(
          eq(inventoryMove.productId, productId),
          variantCondition,
          eq(inventoryMove.fromLocationId, locationId),
          eq(inventoryMove.businessId, businessId),
          eq(inventoryMove.state, 'DONE'),
        ),
      );

    const inbound = parseFloat(inboundResult[0]?.total ?? '0');
    const outbound = parseFloat(outboundResult[0]?.total ?? '0');
    const net = inbound - outbound;

    return net.toFixed(6).replace(/\.?0+$/, '0');
  }

  private mapToEntity(row: typeof inventoryMove.$inferSelect): InventoryMove {
    const props: InventoryMoveProps = {
      id: row.id,
      businessId: row.businessId,
      productId: row.productId,
      variantId: row.variantId,
      moveType: row.moveType as MoveType,
      state: row.state as MoveState,
      fromLocationId: row.fromLocationId,
      toLocationId: row.toLocationId,
      quantity: row.quantity,
      unitOfMeasureId: row.unitOfMeasureId,
      reference: row.reference,
      notes: row.notes,
      externalId: row.externalId,
      originTable: row.originTable,
      originId: row.originId,
      confirmedAt: row.confirmedAt ?? null,
      doneAt: row.doneAt ?? null,
      cancelledAt: row.cancelledAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt ?? null,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
    };
    return InventoryMove.fromProps(props);
  }
}
