import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { CartRepository } from "../../domain/repositories/cart.repository.js";
import type { Cart } from "../../domain/entities/cart.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface ApplyCouponInput {
  cartId: string;
  couponCode: string;
}

export interface ApplyCouponOutput {
  cart: Cart;
  discountAmount: number;
}

@Injectable()
export class ApplyCouponUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.CART_REPOSITORY)
    private readonly cartRepo: CartRepository,
  ) {}

  async execute(input: ApplyCouponInput): Promise<ApplyCouponOutput> {
    const cart = await this.cartRepo.findById(input.cartId);
    if (!cart) {
      throw new NotFoundException("Carrito no encontrado");
    }

    if (cart.isExpired()) {
      throw new BadRequestException("Carrito ha expirado");
    }

    const coupon = await this.validateCoupon(input.couponCode, cart.subtotal);
    if (!coupon) {
      throw new BadRequestException("Cupón inválido o expirado");
    }

    const discountAmount = this.calculateDiscount(coupon, cart.subtotal);
    cart.discountAmount = discountAmount;
    cart.applyCoupon(coupon.id);
    await this.cartRepo.update(cart);

    return { cart, discountAmount };
  }

  private async validateCoupon(code: string, subtotal: number): Promise<{ id: string; discount: number } | null> {
    return null;
  }

  private calculateDiscount(coupon: { id: string; discount: number }, subtotal: number): number {
    return 0;
  }
}
