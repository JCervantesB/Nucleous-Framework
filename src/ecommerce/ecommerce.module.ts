import { Module } from "@nestjs/common";
import { ECOMMERCE_TOKENS } from "./domain/ecommerce.tokens.js";
import {
  DrizzleOrderRepository,
  DrizzleOrderLineRepository,
} from "./infrastructure/persistence/drizzle-order.repository.js";
import {
  DrizzleCartRepository,
  DrizzleCartLineRepository,
} from "./infrastructure/persistence/drizzle-cart.repository.js";
import {
  DrizzleCustomerRepository,
  DrizzleCustomerAddressRepository,
} from "./infrastructure/persistence/drizzle-customer.repository.js";
import { DrizzleShipmentRepository } from "./infrastructure/persistence/drizzle-shipment.repository.js";

@Module({
  providers: [
    {
      provide: ECOMMERCE_TOKENS.ORDER_REPOSITORY,
      useClass: DrizzleOrderRepository,
    },
    {
      provide: ECOMMERCE_TOKENS.ORDER_LINE_REPOSITORY,
      useClass: DrizzleOrderLineRepository,
    },
    {
      provide: ECOMMERCE_TOKENS.CART_REPOSITORY,
      useClass: DrizzleCartRepository,
    },
    {
      provide: ECOMMERCE_TOKENS.CART_LINE_REPOSITORY,
      useClass: DrizzleCartLineRepository,
    },
    {
      provide: ECOMMERCE_TOKENS.CUSTOMER_REPOSITORY,
      useClass: DrizzleCustomerRepository,
    },
    {
      provide: ECOMMERCE_TOKENS.CUSTOMER_ADDRESS_REPOSITORY,
      useClass: DrizzleCustomerAddressRepository,
    },
    {
      provide: ECOMMERCE_TOKENS.SHIPMENT_REPOSITORY,
      useClass: DrizzleShipmentRepository,
    },
  ],
  exports: [
    ECOMMERCE_TOKENS.ORDER_REPOSITORY,
    ECOMMERCE_TOKENS.ORDER_LINE_REPOSITORY,
    ECOMMERCE_TOKENS.CART_REPOSITORY,
    ECOMMERCE_TOKENS.CART_LINE_REPOSITORY,
    ECOMMERCE_TOKENS.CUSTOMER_REPOSITORY,
    ECOMMERCE_TOKENS.CUSTOMER_ADDRESS_REPOSITORY,
    ECOMMERCE_TOKENS.SHIPMENT_REPOSITORY,
  ],
})
export class EcommerceModule {}
