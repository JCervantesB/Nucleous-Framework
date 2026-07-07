import { Cart, CartProps } from "../entities/cart.entity.js";
import { CartLine, CartLineProps } from "../entities/cart-line.entity.js";

export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  findByCustomerId(customerId: string): Promise<Cart | null>;
  findBySessionId(sessionId: string): Promise<Cart | null>;
  findActiveByCustomerOrSession(customerId: string | null, sessionId: string | null): Promise<Cart | null>;
  create(cart: Cart): Promise<void>;
  update(cart: Cart): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CartLineRepository {
  findById(id: string): Promise<CartLine | null>;
  findByCartId(cartId: string): Promise<CartLine[]>;
  findByCartIdAndProductId(cartId: string, productId: string, variantId?: string): Promise<CartLine | null>;
  create(cartLine: CartLine): Promise<void>;
  update(cartLine: CartLine): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByCartId(cartId: string): Promise<void>;
}

export interface CartLinePropsDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
}

export function buildCartLine(
  cartId: string,
  props: CartLinePropsDTO,
  id: string
): CartLine {
  return new CartLine({
    id,
    cartId,
    productId: props.productId,
    variantId: props.variantId ?? null,
    quantity: props.quantity,
    unitPrice: props.unitPrice,
    createdAt: new Date(),
    updatedAt: null,
  });
}
