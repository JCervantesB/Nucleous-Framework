export interface CartProps {
  id: string;
  businessId: string;
  customerId: string | null;
  sessionId: string | null;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponId: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Cart {
  readonly id: string;
  readonly businessId: string;
  customerId: string | null;
  sessionId: string | null;
  readonly currencyCode: string;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponId: string | null;
  expiresAt: Date | null;
  readonly createdAt: Date;
  updatedAt: Date | null;

  constructor(props: CartProps) {
    this.id = props.id;
    this.businessId = props.businessId;
    this.customerId = props.customerId;
    this.sessionId = props.sessionId;
    this.currencyCode = props.currencyCode;
    this.subtotal = props.subtotal;
    this.discountAmount = props.discountAmount;
    this.total = props.total;
    this.couponId = props.couponId;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  recalculateTotal(): void {
    this.total = Math.max(0, this.subtotal - this.discountAmount);
    this.updatedAt = new Date();
  }

  applyCoupon(couponId: string): void {
    this.couponId = couponId;
    this.updatedAt = new Date();
  }

  removeCoupon(): void {
    this.couponId = null;
    this.updatedAt = new Date();
  }

  toProps(): CartProps {
    return {
      id: this.id,
      businessId: this.businessId,
      customerId: this.customerId,
      sessionId: this.sessionId,
      currencyCode: this.currencyCode,
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      total: this.total,
      couponId: this.couponId,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
