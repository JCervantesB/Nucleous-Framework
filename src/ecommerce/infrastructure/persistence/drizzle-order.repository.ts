import { Injectable, Inject } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { db } from "#app/database/client";
import { order, orderLine } from "#app/database/schema/ecommerce";
import { Order, OrderProps } from "../../domain/entities/order.entity.js";
import { OrderLine, OrderLineProps } from "../../domain/entities/order-line.entity.js";
import { OrderRepository, OrderLineRepository } from "../../domain/repositories/order.repository.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

function mapRowToOrder(row: typeof order.$inferSelect): Order {
  const props: OrderProps = {
    id: row.id,
    businessId: row.businessId,
    customerId: row.customerId,
    status: row.status as OrderProps["status"],
    paymentStatus: row.paymentStatus as OrderProps["paymentStatus"],
    subtotal: row.subtotal,
    taxAmount: row.taxAmount,
    shippingCost: row.shippingCost,
    discountAmount: row.discountAmount,
    total: row.total,
    currencyCode: row.currencyCode,
    notes: row.notes,
    shippingAddressId: row.shippingAddressId,
    billingAddressId: row.billingAddressId,
    couponId: row.couponId,
    paymentIntentId: row.paymentIntentId,
    transactionId: row.transactionId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    confirmedAt: row.confirmedAt,
    shippedAt: row.shippedAt,
    deliveredAt: row.deliveredAt,
    cancelledAt: row.cancelledAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
  return new Order(props);
}

function mapRowToOrderLine(row: typeof orderLine.$inferSelect): OrderLine {
  const props: OrderLineProps = {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    variantId: row.variantId,
    sku: row.sku,
    name: row.name,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    taxRate: row.taxRate,
    taxAmount: row.taxAmount,
    discountAmount: row.discountAmount,
    subtotal: row.subtotal,
    createdAt: row.createdAt,
  };
  return new OrderLine(props);
}

@Injectable()
export class DrizzleOrderRepository implements OrderRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<Order | null> {
    const result = await this._db.select().from(order).where(eq(order.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToOrder(result[0]);
  }

  async findByBusinessAndId(businessId: string, id: string): Promise<Order | null> {
    const result = await this._db
      .select()
      .from(order)
      .where(eq(order.id, id))
      .limit(1);
    if (result.length === 0) return null;
    if (result[0].businessId !== businessId) return null;
    return mapRowToOrder(result[0]);
  }

  async findByCustomer(
    customerId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<{ data: Order[]; total: number }> {
    const customerCondition = eq(order.customerId, customerId);
    const statusCondition = options?.status ? eq(order.status, options.status) : undefined;
    const conditions = statusCondition ? and(customerCondition, statusCondition) : customerCondition;

    const data = await this._db
      .select()
      .from(order)
      .where(conditions)
      .limit(options?.limit ?? 20)
      .offset(options?.offset ?? 0)
      .orderBy(order.createdAt);

    const countResult = await this._db
      .select({ count: order.id })
      .from(order)
      .where(conditions);

    return {
      data: data.map(mapRowToOrder),
      total: countResult.length,
    };
  }

  async create(entity: Order): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(order).values({
      id: props.id,
      businessId: props.businessId,
      customerId: props.customerId,
      status: props.status,
      paymentStatus: props.paymentStatus,
      subtotal: props.subtotal,
      taxAmount: props.taxAmount,
      shippingCost: props.shippingCost,
      discountAmount: props.discountAmount,
      total: props.total,
      currencyCode: props.currencyCode,
      notes: props.notes,
      shippingAddressId: props.shippingAddressId,
      billingAddressId: props.billingAddressId,
      couponId: props.couponId,
      paymentIntentId: props.paymentIntentId,
      transactionId: props.transactionId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      confirmedAt: props.confirmedAt,
      shippedAt: props.shippedAt,
      deliveredAt: props.deliveredAt,
      cancelledAt: props.cancelledAt,
      createdBy: props.createdBy,
      updatedBy: props.updatedBy,
    });
  }

  async update(entity: Order): Promise<void> {
    const props = entity.toProps();
    await this._db
      .update(order)
      .set({
        status: props.status,
        paymentStatus: props.paymentStatus,
        subtotal: props.subtotal,
        taxAmount: props.taxAmount,
        shippingCost: props.shippingCost,
        discountAmount: props.discountAmount,
        total: props.total,
        notes: props.notes,
        shippingAddressId: props.shippingAddressId,
        billingAddressId: props.billingAddressId,
        couponId: props.couponId,
        paymentIntentId: props.paymentIntentId,
        transactionId: props.transactionId,
        updatedAt: props.updatedAt,
        confirmedAt: props.confirmedAt,
        shippedAt: props.shippedAt,
        deliveredAt: props.deliveredAt,
        cancelledAt: props.cancelledAt,
        updatedBy: props.updatedBy,
      })
      .where(eq(order.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this._db.delete(order).where(eq(order.id, id));
  }
}

@Injectable()
export class DrizzleOrderLineRepository implements OrderLineRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<OrderLine | null> {
    const result = await this._db.select().from(orderLine).where(eq(orderLine.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToOrderLine(result[0]);
  }

  async findByOrderId(orderId: string): Promise<OrderLine[]> {
    const result = await this._db
      .select()
      .from(orderLine)
      .where(eq(orderLine.orderId, orderId));
    return result.map(mapRowToOrderLine);
  }

  async create(entity: OrderLine): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(orderLine).values({
      id: props.id,
      orderId: props.orderId,
      productId: props.productId,
      variantId: props.variantId,
      sku: props.sku,
      name: props.name,
      quantity: props.quantity,
      unitPrice: props.unitPrice,
      taxRate: props.taxRate,
      taxAmount: props.taxAmount,
      discountAmount: props.discountAmount,
      subtotal: props.subtotal,
      createdAt: props.createdAt,
    });
  }

  async createMany(entities: OrderLine[]): Promise<void> {
    const values = entities.map((entity) => {
      const props = entity.toProps();
      return {
        id: props.id,
        orderId: props.orderId,
        productId: props.productId,
        variantId: props.variantId,
        sku: props.sku,
        name: props.name,
        quantity: props.quantity,
        unitPrice: props.unitPrice,
        taxRate: props.taxRate,
        taxAmount: props.taxAmount,
        discountAmount: props.discountAmount,
        subtotal: props.subtotal,
        createdAt: props.createdAt,
      };
    });
    await this._db.insert(orderLine).values(values);
  }

  async deleteByOrderId(orderId: string): Promise<void> {
    await this._db.delete(orderLine).where(eq(orderLine.orderId, orderId));
  }
}
