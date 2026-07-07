import { Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import type { OrderRepository } from "../../domain/repositories/order.repository.js";
import { Order } from "../../domain/entities/order.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface CancelOrderInput {
  orderId: string;
  businessId: string;
  reason?: string;
}

export interface CancelOrderOutput {
  order: Order;
}

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepo: OrderRepository,
  ) {}

  async execute(input: CancelOrderInput): Promise<CancelOrderOutput> {
    const order = await this.orderRepo.findByBusinessAndId(input.businessId, input.orderId);
    if (!order) {
      throw new NotFoundException("Orden no encontrada");
    }

    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      throw new BadRequestException("No se puede cancelar una orden enviada o entregada");
    }

    order.cancel(input.reason);
    await this.orderRepo.update(order);

    return { order };
  }
}
