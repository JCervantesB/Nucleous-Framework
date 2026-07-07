import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CartRepository, CartLineRepository } from "../../domain/repositories/cart.repository.js";
import { Cart } from "../../domain/entities/cart.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface RemoveCartLineInput {
  cartLineId: string;
}

@Injectable()
export class RemoveCartLineUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.CART_REPOSITORY)
    private readonly cartRepo: CartRepository,
    @Inject(ECOMMERCE_TOKENS.CART_LINE_REPOSITORY)
    private readonly cartLineRepo: CartLineRepository,
  ) {}

  async execute(input: RemoveCartLineInput): Promise<void> {
    const cartLine = await this.cartLineRepo.findById(input.cartLineId);
    if (!cartLine) {
      throw new NotFoundException("Línea de carrito no encontrada");
    }

    const cartId = cartLine.cartId;
    await this.cartLineRepo.delete(input.cartLineId);

    const cart = await this.cartRepo.findById(cartId);
    if (cart) {
      await this.recalculateCart(cart);
    }
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
