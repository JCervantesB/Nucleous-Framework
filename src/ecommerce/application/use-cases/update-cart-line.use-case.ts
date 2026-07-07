import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CartRepository, CartLineRepository } from "../../domain/repositories/cart.repository.js";
import { Cart } from "../../domain/entities/cart.entity.js";
import { CartLine } from "../../domain/entities/cart-line.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface UpdateCartLineInput {
  cartLineId: string;
  quantity: number;
}

export interface UpdateCartLineOutput {
  cart: Cart;
  cartLine: CartLine;
}

@Injectable()
export class UpdateCartLineUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.CART_REPOSITORY)
    private readonly cartRepo: CartRepository,
    @Inject(ECOMMERCE_TOKENS.CART_LINE_REPOSITORY)
    private readonly cartLineRepo: CartLineRepository,
  ) {}

  async execute(input: UpdateCartLineInput): Promise<UpdateCartLineOutput> {
    const cartLine = await this.cartLineRepo.findById(input.cartLineId);
    if (!cartLine) {
      throw new NotFoundException("Línea de carrito no encontrada");
    }

    if (input.quantity <= 0) {
      await this.cartLineRepo.delete(input.cartLineId);
    } else {
      cartLine.updateQuantity(input.quantity);
      await this.cartLineRepo.update(cartLine);
    }

    const cart = await this.cartRepo.findById(cartLine.cartId);
    if (!cart) {
      throw new NotFoundException("Carrito no encontrado");
    }

    await this.recalculateCart(cart);

    return { cart, cartLine };
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
