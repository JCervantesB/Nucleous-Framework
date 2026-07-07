import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { OrderRepository, OrderLineRepository } from "../../domain/repositories/order.repository.js";
import type { ShipmentRepository } from "../../domain/repositories/shipment.repository.js";
import { Order } from "../../domain/entities/order.entity.js";
import { OrderLine } from "../../domain/entities/order-line.entity.js";
import { Shipment } from "../../domain/entities/shipment.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface GetOrderInput {
  orderId: string;
  businessId: string;
}

export interface GetOrderOutput {
  order: Order;
  lines: OrderLine[];
  shipments: Shipment[];
}

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepo: OrderRepository,
    @Inject(ECOMMERCE_TOKENS.ORDER_LINE_REPOSITORY)
    private readonly orderLineRepo: OrderLineRepository,
    @Inject(ECOMMERCE_TOKENS.SHIPMENT_REPOSITORY)
    private readonly shipmentRepo: ShipmentRepository,
  ) {}

  async execute(input: GetOrderInput): Promise<GetOrderOutput> {
    const order = await this.orderRepo.findByBusinessAndId(input.businessId, input.orderId);
    if (!order) {
      throw new NotFoundException("Orden no encontrada");
    }

    const lines = await this.orderLineRepo.findByOrderId(input.orderId);
    const shipments = await this.shipmentRepo.findByOrderId(input.orderId);

    return { order, lines, shipments };
  }
}
