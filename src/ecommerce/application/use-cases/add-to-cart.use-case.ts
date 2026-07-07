import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CartRepository, CartLineRepository } from "../../domain/repositories/cart.repository.js";
import { Cart, CartProps } from "../../domain/entities/cart.entity.js";
import { CartLine } from "../../domain/entities/cart-line.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface AddToCartInput {
  businessId: string;
  cartId?: string;
  customerId?: string;
  sessionId?: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  currencyCode?: string;
}

export interface AddToCartOutput {
  cart: Cart;
  cartLine: CartLine;
  isNewCart: boolean;
}

@Injectable()
export class AddToCartUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.CART_REPOSITORY)
    private readonly cartRepo: CartRepository,
    @Inject(ECOMMERCE_TOKENS.CART_LINE_REPOSITORY)
    private readonly cartLineRepo: CartLineRepository,
  ) {}

  async execute(input: AddToCartInput): Promise<AddToCartOutput> {
    let cart: Cart;
    let isNewCart = false;

    const existingCart = await this.cartRepo.findActiveByCustomerOrSession(
      input.customerId ?? null,
      input.sessionId ?? null,
    );

    if (existingCart) {
      cart = existingCart;
    } else {
      const now = new Date();
      const expiresAt = input.sessionId
        ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        : null;

      const cartProps: CartProps = {
        id: crypto.randomUUID(),
        businessId: input.businessId,
        customerId: input.customerId ?? null,
        sessionId: input.sessionId ?? null,
        currencyCode: input.currencyCode ?? "MXN",
        subtotal: 0,
        discountAmount: 0,
        total: 0,
        couponId: null,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      cart = new Cart(cartProps);
      await this.cartRepo.create(cart);
      isNewCart = true;
    }

    const existingLine = await this.cartLineRepo.findByCartIdAndProductId(
      cart.id,
      input.productId,
      input.variantId,
    );

    let cartLine: CartLine;

    if (existingLine) {
      existingLine.updateQuantity(existingLine.quantity + input.quantity);
      await this.cartLineRepo.update(existingLine);
      cartLine = existingLine;
    } else {
      const lineProps = {
        id: crypto.randomUUID(),
        cartId: cart.id,
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        createdAt: new Date(),
        updatedAt: null,
      };
      cartLine = new CartLine(lineProps);
      await this.cartLineRepo.create(cartLine);
    }

    await this.recalculateCart(cart);

    return { cart, cartLine, isNewCart };
  }

  private async recalculateCart(cart: Cart): Promise<void> {
    const lines = await this.cartLineRepo.findByCartId(cart.id);
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    cart.subtotal = subtotal;
    cart.total = Math.max(0, subtotal - cart.discountAmount);
    cart.updatedAt = new Date();
    await this.cartRepo.update(cart);
  }
}
