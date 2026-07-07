import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { OrderRepository, OrderLineRepository } from "../../domain/repositories/order.repository.js";
import type { CartRepository, CartLineRepository } from "../../domain/repositories/cart.repository.js";
import type { PaymentProvider } from "../../domain/ports/payment.provider.js";
import { Order } from "../../domain/entities/order.entity.js";
import { OrderLine } from "../../domain/entities/order-line.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface CreateOrderFromCartInput {
  cartId: string;
  shippingAddressId: string;
  billingAddressId: string;
  customerId: string;
  businessId: string;
  shippingMethodId?: string;
  notes?: string;
}

export interface CreateOrderFromCartOutput {
  order: Order;
  paymentIntentId: string | null;
}

@Injectable()
export class CreateOrderFromCartUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepo: OrderRepository,
    @Inject(ECOMMERCE_TOKENS.ORDER_LINE_REPOSITORY)
    private readonly orderLineRepo: OrderLineRepository,
    @Inject(ECOMMERCE_TOKENS.CART_REPOSITORY)
    private readonly cartRepo: CartRepository,
    @Inject(ECOMMERCE_TOKENS.CART_LINE_REPOSITORY)
    private readonly cartLineRepo: CartLineRepository,
    @Inject(ECOMMERCE_TOKENS.PAYMENT_PROVIDER)
    private readonly paymentProvider: PaymentProvider,
  ) {}

  async execute(input: CreateOrderFromCartInput): Promise<CreateOrderFromCartOutput> {
    const cart = await this.cartRepo.findById(input.cartId);
    if (!cart) {
      throw new NotFoundException("Carrito no encontrado");
    }

    if (cart.isExpired()) {
      throw new BadRequestException("Carrito ha expirado");
    }

    const cartLines = await this.cartLineRepo.findByCartId(input.cartId);
    if (cartLines.length === 0) {
      throw new BadRequestException("Carrito está vacío");
    }

    const subtotal = cartLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const taxAmount = Math.round(subtotal * 0.16);
    const shippingCost = 0;
    const total = subtotal + taxAmount + shippingCost - cart.discountAmount;

    const now = new Date();
    const orderProps = {
      id: crypto.randomUUID(),
      businessId: input.businessId,
      customerId: input.customerId,
      status: "DRAFT" as const,
      paymentStatus: "PENDING" as const,
      subtotal,
      taxAmount,
      shippingCost,
      discountAmount: cart.discountAmount,
      total,
      currencyCode: cart.currencyCode,
      notes: input.notes ?? null,
      shippingAddressId: input.shippingAddressId,
      billingAddressId: input.billingAddressId,
      couponId: cart.couponId,
      paymentIntentId: null,
      transactionId: null,
      createdAt: now,
      updatedAt: now,
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null,
      createdBy: null,
      updatedBy: null,
    };

    const order = new Order(orderProps);
    await this.orderRepo.create(order);

    for (const line of cartLines) {
      const lineSubtotal = line.unitPrice * line.quantity;
      const lineTaxAmount = Math.round(lineSubtotal * 0.16);
      const orderLine = new OrderLine({
        id: crypto.randomUUID(),
        orderId: order.id,
        productId: line.productId,
        variantId: line.variantId,
        sku: "",
        name: "",
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxRate: 16,
        taxAmount: lineTaxAmount,
        discountAmount: 0,
        subtotal: lineSubtotal,
        createdAt: now,
      });
      await this.orderLineRepo.create(orderLine);
    }

    let paymentIntentId: string | null = null;

    return { order, paymentIntentId };
  }
}
