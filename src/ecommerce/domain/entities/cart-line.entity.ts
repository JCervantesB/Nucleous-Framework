export interface CartLineProps {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date | null;
}

export class CartLine {
  readonly id: string;
  readonly cartId: string;
  readonly productId: string;
  readonly variantId: string | null;
  quantity: number;
  unitPrice: number;
  readonly createdAt: Date;
  updatedAt: Date | null;

  constructor(props: CartLineProps) {
    this.id = props.id;
    this.cartId = props.cartId;
    this.productId = props.productId;
    this.variantId = props.variantId;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  updateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }
    this.quantity = quantity;
    this.updatedAt = new Date();
  }

  get lineTotal(): number {
    return this.unitPrice * this.quantity;
  }

  toProps(): CartLineProps {
    return {
      id: this.id,
      cartId: this.cartId,
      productId: this.productId,
      variantId: this.variantId,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
