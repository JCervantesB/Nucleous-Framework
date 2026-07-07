import { Inject, Injectable } from "@nestjs/common";
import type { OrderRepository } from "../../domain/repositories/order.repository.js";
import type { OrderStatus } from "../../domain/entities/order.entity.js";
import type { Order } from "../../domain/entities/order.entity.js";
import { ECOMMERCE_TOKENS } from "../../domain/ecommerce.tokens.js";

export interface ListCustomerOrdersInput {
  customerId: string;
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

export interface ListCustomerOrdersOutput {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ListCustomerOrdersUseCase {
  constructor(
    @Inject(ECOMMERCE_TOKENS.ORDER_REPOSITORY)
    private readonly orderRepo: OrderRepository,
  ) {}

  async execute(input: ListCustomerOrdersInput): Promise<ListCustomerOrdersOutput> {
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const offset = (page - 1) * pageSize;

    const result = await this.orderRepo.findByCustomer(input.customerId, {
      status: input.status,
      limit: pageSize,
      offset,
    });

    return {
      data: result.data,
      total: result.total,
      page,
      pageSize,
    };
  }
}
