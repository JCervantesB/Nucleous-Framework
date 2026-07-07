import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { OrderRepository, OrderLineRepository } from "../../domain/repositories/order.repository.js";
import type { InventoryOrderFulfillmentService } from "../../domain/ports/inventory.port.js";
import { Order } from "../../domain/entities/order.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface ConfirmOrderInput {
  orderId: string;
  businessId: string;
  transactionId: string;
  fulfillmentLocationId: string;
}

export interface ConfirmOrderOutput {
  order: Order;
}

@Injectable()
export class ConfirmOrderUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepo: OrderRepository,
    @Inject(ECOMMERCE_TOKENS.ORDER_LINE_REPOSITORY)
    private readonly orderLineRepo: OrderLineRepository,
    @Inject(ECOMMERCE_TOKENS.INVENTORY_SERVICE)
    private readonly inventoryService: InventoryOrderFulfillmentService,
  ) {}

  async execute(input: ConfirmOrderInput): Promise<ConfirmOrderOutput> {
    const order = await this.orderRepo.findByBusinessAndId(input.businessId, input.orderId);
    if (!order) {
      throw new NotFoundException("Orden no encontrada");
    }

    if (order.status !== "DRAFT") {
      throw new BadRequestException("Solo se pueden confirmar órdenes en estado DRAFT");
    }

    const orderLines = await this.orderLineRepo.findByOrderId(input.orderId);

    for (const line of orderLines) {
      await this.inventoryService.createOutboundMove({
        businessId: input.businessId,
        productId: line.productId,
        variantId: line.variantId ?? undefined,
        locationId: input.fulfillmentLocationId,
        quantity: line.quantity,
        reference: order.id,
      });
    }

    order.confirm(input.transactionId);
    await this.orderRepo.update(order);

    return { order };
  }
}
