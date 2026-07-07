import { Injectable, Inject } from "@nestjs/common";
import { eq, and, isNull, or } from "drizzle-orm";
import { db } from "#app/database/client";
import { cart, cartLine } from "#app/database/schema/ecommerce";
import { Cart, CartProps } from "../../domain/entities/cart.entity.js";
import { CartLine, CartLineProps } from "../../domain/entities/cart-line.entity.js";
import { CartRepository, CartLineRepository } from "../../domain/repositories/cart.repository.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

function mapRowToCart(row: typeof cart.$inferSelect): Cart {
  const props: CartProps = {
    id: row.id,
    businessId: row.businessId,
    customerId: row.customerId,
    sessionId: row.sessionId,
    currencyCode: row.currencyCode,
    subtotal: row.subtotal,
    discountAmount: row.discountAmount,
    total: row.total,
    couponId: row.couponId,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  return new Cart(props);
}

function mapRowToCartLine(row: typeof cartLine.$inferSelect): CartLine {
  const props: CartLineProps = {
    id: row.id,
    cartId: row.cartId,
    productId: row.productId,
    variantId: row.variantId,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  return new CartLine(props);
}

@Injectable()
export class DrizzleCartRepository implements CartRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<Cart | null> {
    const result = await this._db.select().from(cart).where(eq(cart.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToCart(result[0]);
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    const result = await this._db
      .select()
      .from(cart)
      .where(eq(cart.customerId, customerId))
      .limit(1);
    if (result.length === 0) return null;
    return mapRowToCart(result[0]);
  }

  async findBySessionId(sessionId: string): Promise<Cart | null> {
    const result = await this._db
      .select()
      .from(cart)
      .where(eq(cart.sessionId, sessionId))
      .limit(1);
    if (result.length === 0) return null;
    return mapRowToCart(result[0]);
  }

  async findActiveByCustomerOrSession(
    customerId: string | null,
    sessionId: string | null
  ): Promise<Cart | null> {
    if (!customerId && !sessionId) return null;

    let result;
    if (customerId) {
      result = await this._db
        .select()
        .from(cart)
        .where(
          and(
            eq(cart.customerId, customerId),
            or(isNull(cart.expiresAt), eq(cart.expiresAt, new Date()))
          )
        )
        .limit(1);
    } else {
      result = await this._db
        .select()
        .from(cart)
        .where(
          and(
            eq(cart.sessionId, sessionId!),
            or(isNull(cart.expiresAt), eq(cart.expiresAt, new Date()))
          )
        )
        .limit(1);
    }

    if (result.length === 0) return null;
    return mapRowToCart(result[0]);
  }

  async create(entity: Cart): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(cart).values({
      id: props.id,
      businessId: props.businessId,
      customerId: props.customerId,
      sessionId: props.sessionId,
      currencyCode: props.currencyCode,
      subtotal: props.subtotal,
      discountAmount: props.discountAmount,
      total: props.total,
      couponId: props.couponId,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(entity: Cart): Promise<void> {
    const props = entity.toProps();
    await this._db
      .update(cart)
      .set({
        customerId: props.customerId,
        subtotal: props.subtotal,
        discountAmount: props.discountAmount,
        total: props.total,
        couponId: props.couponId,
        expiresAt: props.expiresAt,
        updatedAt: props.updatedAt,
      })
      .where(eq(cart.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this._db.delete(cart).where(eq(cart.id, id));
  }
}

@Injectable()
export class DrizzleCartLineRepository implements CartLineRepository {
  constructor(
    @Inject("DB") private readonly _db: typeof db
  ) {}

  async findById(id: string): Promise<CartLine | null> {
    const result = await this._db.select().from(cartLine).where(eq(cartLine.id, id)).limit(1);
    if (result.length === 0) return null;
    return mapRowToCartLine(result[0]);
  }

  async findByCartId(cartId: string): Promise<CartLine[]> {
    const result = await this._db
      .select()
      .from(cartLine)
      .where(eq(cartLine.cartId, cartId));
    return result.map(mapRowToCartLine);
  }

  async findByCartIdAndProductId(
    cartId: string,
    productId: string,
    variantId?: string
  ): Promise<CartLine | null> {
    const conditions = [eq(cartLine.cartId, cartId), eq(cartLine.productId, productId)];
    if (variantId) {
      conditions.push(eq(cartLine.variantId, variantId));
    } else {
      const result = await this._db
        .select()
        .from(cartLine)
        .where(and(...conditions, eq(cartLine.variantId, variantId!)))
        .limit(1);
      if (result.length === 0) return null;
      return mapRowToCartLine(result[0]);
    }

    const result = await this._db
      .select()
      .from(cartLine)
      .where(and(...conditions))
      .limit(1);
    if (result.length === 0) return null;
    return mapRowToCartLine(result[0]);
  }

  async create(entity: CartLine): Promise<void> {
    const props = entity.toProps();
    await this._db.insert(cartLine).values({
      id: props.id,
      cartId: props.cartId,
      productId: props.productId,
      variantId: props.variantId,
      quantity: props.quantity,
      unitPrice: props.unitPrice,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  async update(entity: CartLine): Promise<void> {
    const props = entity.toProps();
    await this._db
      .update(cartLine)
      .set({
        quantity: props.quantity,
        updatedAt: props.updatedAt,
      })
      .where(eq(cartLine.id, props.id));
  }

  async delete(id: string): Promise<void> {
    await this._db.delete(cartLine).where(eq(cartLine.id, id));
  }

  async deleteByCartId(cartId: string): Promise<void> {
    await this._db.delete(cartLine).where(eq(cartLine.cartId, cartId));
  }
}
