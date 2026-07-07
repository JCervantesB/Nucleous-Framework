import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { db } from "#app/database/client";
import { shipment } from "#app/database/schema/ecommerce";
import { Shipment, ShipmentProps } from "../../domain/entities/shipment.entity.js";
import { ShipmentRepository } from "../../domain/repositories/shipment.repository.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

function mapRowToShipment(row: typeof shipment.$inferSelect): Shipment {
  const props: ShipmentProps = {
    id: row.id,
    orderId: row.orderId,
    orderLineIds: row.orderLineIds ?? [],
    carrier: row.carrier,
    trackingNumber: row.trackingNumber,
    status: row.status as ShipmentProps["status"],
    shippingMethodId: row.shippingMethodId,
    estimatedDelivery: row.estimatedDelivery,
    actualDelivery: row.actualDelivery,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  return new Shipment(props);
}

@Injectable()
export class DrizzleShipmentRepository implements ShipmentRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<Shipment | null> {
    const result = await this._db.select().from(shipment).where(eq(shipment.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToShipment(result[0]);
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    const result = await this._db
      .select()
      .from(shipment)
      .where(eq(shipment.orderId, orderId));
    return result.map(mapRowToShipment);
  }

  async create(entity: Shipment): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(shipment).values({
      id: props.id,
      orderId: props.orderId,
      orderLineIds: props.orderLineIds,
      carrier: props.carrier,
      trackingNumber: props.trackingNumber,
      status: props.status,
      shippingMethodId: props.shippingMethodId,
      estimatedDelivery: props.estimatedDelivery,
      actualDelivery: props.actualDelivery,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(entity: Shipment): Promise<void> {
    const props = entity.toProps();
    await this._db
      .update(shipment)
      .set({
        orderLineIds: props.orderLineIds,
        carrier: props.carrier,
        trackingNumber: props.trackingNumber,
        status: props.status,
        shippingMethodId: props.shippingMethodId,
        estimatedDelivery: props.estimatedDelivery,
        actualDelivery: props.actualDelivery,
        updatedAt: props.updatedAt,
      })
      .where(eq(shipment.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this._db.delete(shipment).where(eq(shipment.id, id));
  }
}
