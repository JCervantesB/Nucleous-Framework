export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export interface OrderProps {
  id: string;
  businessId: string;
  customerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currencyCode: string;
  notes: string | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  couponId: string | null;
  paymentIntentId: string | null;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
}

export class Order {
  readonly id: string;
  readonly businessId: string;
  readonly customerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  readonly currencyCode: string;
  notes: string | null;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  couponId: string | null;
  paymentIntentId: string | null;
  transactionId: string | null;
  readonly createdAt: Date;
  updatedAt: Date | null;
  confirmedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;

  constructor(props: OrderProps) {
    this.id = props.id;
    this.businessId = props.businessId;
    this.customerId = props.customerId;
    this.status = props.status;
    this.paymentStatus = props.paymentStatus;
    this.subtotal = props.subtotal;
    this.taxAmount = props.taxAmount;
    this.shippingCost = props.shippingCost;
    this.discountAmount = props.discountAmount;
    this.total = props.total;
    this.currencyCode = props.currencyCode;
    this.notes = props.notes;
    this.shippingAddressId = props.shippingAddressId;
    this.billingAddressId = props.billingAddressId;
    this.couponId = props.couponId;
    this.paymentIntentId = props.paymentIntentId;
    this.transactionId = props.transactionId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.confirmedAt = props.confirmedAt;
    this.shippedAt = props.shippedAt;
    this.deliveredAt = props.deliveredAt;
    this.cancelledAt = props.cancelledAt;
    this.createdBy = props.createdBy;
    this.updatedBy = props.updatedBy;
  }

  confirm(transactionId: string): void {
    if (this.status !== "DRAFT") {
      throw new Error("Solo se pueden confirmar órdenes en estado DRAFT");
    }
    this.status = "CONFIRMED";
    this.paymentStatus = "COMPLETED";
    this.transactionId = transactionId;
    this.confirmedAt = new Date();
    this.updatedAt = new Date();
  }

  cancel(reason?: string): void {
    if (this.status === "SHIPPED" || this.status === "DELIVERED") {
      throw new Error("No se puede cancelar una orden enviada o entregada");
    }
    this.status = "CANCELLED";
    this.cancelledAt = new Date();
    this.updatedAt = new Date();
    if (reason) {
      this.notes = this.notes ? `${this.notes}\n${reason}` : reason;
    }
  }

  toProps(): OrderProps {
    return {
      id: this.id,
      businessId: this.businessId,
      customerId: this.customerId,
      status: this.status,
      paymentStatus: this.paymentStatus,
      subtotal: this.subtotal,
      taxAmount: this.taxAmount,
      shippingCost: this.shippingCost,
      discountAmount: this.discountAmount,
      total: this.total,
      currencyCode: this.currencyCode,
      notes: this.notes,
      shippingAddressId: this.shippingAddressId,
      billingAddressId: this.billingAddressId,
      couponId: this.couponId,
      paymentIntentId: this.paymentIntentId,
      transactionId: this.transactionId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      confirmedAt: this.confirmedAt,
      shippedAt: this.shippedAt,
      deliveredAt: this.deliveredAt,
      cancelledAt: this.cancelledAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };
  }
}
