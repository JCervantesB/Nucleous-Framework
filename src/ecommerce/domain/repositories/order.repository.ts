import { Order, OrderProps } from "../entities/order.entity.js";
import { OrderLine, OrderLineProps } from "../entities/order-line.entity.js";

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByBusinessAndId(businessId: string, id: string): Promise<Order | null>;
  findByCustomer(customerId: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Order[]; total: number }>;
  create(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface OrderLineRepository {
  findById(id: string): Promise<OrderLine | null>;
  findByOrderId(orderId: string): Promise<OrderLine[]>;
  create(orderLine: OrderLine): Promise<void>;
  createMany(orderLines: OrderLine[]): Promise<void>;
  deleteByOrderId(orderId: string): Promise<void>;
}

export interface OrderLinePropsDTO {
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountAmount?: number;
}

export function buildOrderLine(
  orderId: string,
  props: OrderLinePropsDTO,
  id: string
): OrderLine {
  const discountAmount = props.discountAmount ?? 0;
  const subtotal = Math.max(0, (props.unitPrice * props.quantity) - discountAmount);
  const taxAmount = Math.round(subtotal * (props.taxRate / 100));

  return new OrderLine({
    id,
    orderId,
    productId: props.productId,
    variantId: props.variantId ?? null,
    sku: props.sku,
    name: props.name,
    quantity: props.quantity,
    unitPrice: props.unitPrice,
    taxRate: props.taxRate,
    taxAmount,
    discountAmount,
    subtotal,
    createdAt: new Date(),
  });
}
