import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import { IsUUID, IsString, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderFromCartUseCase } from "../../application/use-cases/create-order-from-cart.use-case";
import { ConfirmOrderUseCase } from "../../application/use-cases/confirm-order.use-case";
import { CancelOrderUseCase } from "../../application/use-cases/cancel-order.use-case";
import { GetOrderUseCase } from "../../application/use-cases/get-order.use-case";
import { ListCustomerOrdersUseCase } from "../../application/use-cases/list-customer-orders.use-case";

class CreateOrderDto {
  @IsUUID()
  cartId: string;

  @IsUUID()
  shippingAddressId: string;

  @IsUUID()
  billingAddressId: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsUUID()
  shippingMethodId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class ConfirmOrderDto {
  @IsUUID()
  businessId: string;

  @IsUUID()
  transactionId: string;

  @IsUUID()
  fulfillmentLocationId: string;
}

class CancelOrderDto {
  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

class ListOrdersQuery {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsString()
  status?: string;
}

function mapOrderToResponse(order: any) {
  return {
    id: order.id,
    businessId: order.businessId,
    customerId: order.customerId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    shippingCost: order.shippingCost,
    discountAmount: order.discountAmount,
    total: order.total,
    currencyCode: order.currencyCode,
    notes: order.notes,
    shippingAddressId: order.shippingAddressId,
    billingAddressId: order.billingAddressId,
    couponId: order.couponId,
    paymentIntentId: order.paymentIntentId,
    transactionId: order.transactionId,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt?.toISOString() ?? null,
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    shippedAt: order.shippedAt?.toISOString() ?? null,
    deliveredAt: order.deliveredAt?.toISOString() ?? null,
    cancelledAt: order.cancelledAt?.toISOString() ?? null,
  };
}

function mapOrderLineToResponse(line: any) {
  return {
    id: line.id,
    orderId: line.orderId,
    productId: line.productId,
    variantId: line.variantId,
    sku: line.sku,
    name: line.name,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    taxRate: line.taxRate,
    taxAmount: line.taxAmount,
    discountAmount: line.discountAmount,
    subtotal: line.subtotal,
    createdAt: line.createdAt.toISOString(),
  };
}

function mapShipmentToResponse(shipment: any) {
  return {
    id: shipment.id,
    orderId: shipment.orderId,
    orderLineIds: shipment.orderLineIds,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    shippingMethodId: shipment.shippingMethodId,
    estimatedDelivery: shipment.estimatedDelivery?.toISOString() ?? null,
    actualDelivery: shipment.actualDelivery?.toISOString() ?? null,
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt?.toISOString() ?? null,
  };
}

@Controller("orders")
export class OrderController {
  constructor(
    private readonly createOrderFromCartUseCase: CreateOrderFromCartUseCase,
    private readonly confirmOrderUseCase: ConfirmOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listCustomerOrdersUseCase: ListCustomerOrdersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() dto: CreateOrderDto) {
    const result = await this.createOrderFromCartUseCase.execute(dto);
    return {
      order: mapOrderToResponse(result.order),
      paymentIntentId: result.paymentIntentId,
    };
  }

  @Post(":orderId/confirm")
  @HttpCode(HttpStatus.OK)
  async confirmOrder(
    @Param("orderId", ParseUUIDPipe) orderId: string,
    @Body() dto: ConfirmOrderDto,
  ) {
    const result = await this.confirmOrderUseCase.execute({
      orderId,
      ...dto,
    });
    return {
      order: mapOrderToResponse(result.order),
    };
  }

  @Post(":orderId/cancel")
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param("orderId", ParseUUIDPipe) orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    const result = await this.cancelOrderUseCase.execute({
      orderId,
      ...dto,
    });
    return {
      order: mapOrderToResponse(result.order),
    };
  }

  @Get(":orderId")
  async getOrder(
    @Param("orderId", ParseUUIDPipe) orderId: string,
    @Query("businessId", ParseUUIDPipe) businessId: string,
  ) {
    const result = await this.getOrderUseCase.execute({ orderId, businessId });
    return {
      order: mapOrderToResponse(result.order),
      lines: result.lines.map(mapOrderLineToResponse),
      shipments: result.shipments.map(mapShipmentToResponse),
    };
  }

  @Get("customer/:customerId")
  async listCustomerOrders(
    @Param("customerId", ParseUUIDPipe) customerId: string,
    @Query() query: ListOrdersQuery,
  ) {
    const result = await this.listCustomerOrdersUseCase.execute({
      customerId,
      page: query.page,
      pageSize: query.pageSize,
      status: query.status as any,
    });
    return {
      data: result.data.map(mapOrderToResponse),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
