export interface OrderLineProps {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  subtotal: number;
  createdAt: Date;
}

export class OrderLine {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly variantId: string | null;
  readonly sku: string;
  readonly name: string;
  quantity: number;
  unitPrice: number;
  readonly taxRate: number;
  taxAmount: number;
  discountAmount: number;
  subtotal: number;
  readonly createdAt: Date;

  constructor(props: OrderLineProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.productId = props.productId;
    this.variantId = props.variantId;
    this.sku = props.sku;
    this.name = props.name;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.taxRate = props.taxRate;
    this.taxAmount = props.taxAmount;
    this.discountAmount = props.discountAmount;
    this.subtotal = props.subtotal;
    this.createdAt = props.createdAt;
  }

  calculateSubtotal(): number {
    const base = this.unitPrice * this.quantity;
    const discount = this.discountAmount;
    return Math.max(0, base - discount);
  }

  calculateTaxAmount(): number {
    return Math.round((this.unitPrice * this.quantity - this.discountAmount) * (this.taxRate / 100));
  }

  toProps(): OrderLineProps {
    return {
      id: this.id,
      orderId: this.orderId,
      productId: this.productId,
      variantId: this.variantId,
      sku: this.sku,
      name: this.name,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      taxRate: this.taxRate,
      taxAmount: this.taxAmount,
      discountAmount: this.discountAmount,
      subtotal: this.subtotal,
      createdAt: this.createdAt,
    };
  }
}
