import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { CartRepository, CartLineRepository } from "../../domain/repositories/cart.repository.js";
import type { Cart } from "../../domain/entities/cart.entity.js";
import type { CartLine } from "../../domain/entities/cart-line.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface GetCartInput {
  cartId: string;
}

export interface GetCartOutput {
  cart: Cart;
  lines: CartLine[];
}

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.CART_REPOSITORY)
    private readonly cartRepo: CartRepository,
    @Inject(ECOMMERCE_TOKENS.CART_LINE_REPOSITORY)
    private readonly cartLineRepo: CartLineRepository,
  ) {}

  async execute(input: GetCartInput): Promise<GetCartOutput> {
    const cart = await this.cartRepo.findById(input.cartId);
    if (!cart) {
      throw new NotFoundException("Carrito no encontrado");
    }

    if (cart.isExpired()) {
      throw new NotFoundException("Carrito ha expirado");
    }

    const lines = await this.cartLineRepo.findByCartId(input.cartId);

    return { cart, lines };
  }
}
