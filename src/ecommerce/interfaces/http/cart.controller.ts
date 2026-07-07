import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import { IsUUID, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
import { AddToCartUseCase } from "../../application/use-cases/add-to-cart.use-case";
import { UpdateCartLineUseCase } from "../../application/use-cases/update-cart-line.use-case";
import { RemoveCartLineUseCase } from "../../application/use-cases/remove-cart-line.use-case";
import { GetCartUseCase } from "../../application/use-cases/get-cart.use-case";
import { ApplyCouponUseCase } from "../../application/use-cases/apply-coupon.use-case";

class AddToCartDto {
  @IsUUID()
  businessId: string;

  @IsOptional()
  @IsUUID()
  cartId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  variantId?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsOptional()
  @IsString()
  currencyCode?: string;
}

class UpdateCartLineDto {
  @IsUUID()
  cartLineId: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;
}

class ApplyCouponDto {
  @IsUUID()
  cartId: string;

  @IsString()
  couponCode: string;
}

function mapCartToResponse(cart: any) {
  return {
    id: cart.id,
    businessId: cart.businessId,
    customerId: cart.customerId,
    sessionId: cart.sessionId,
    currencyCode: cart.currencyCode,
    subtotal: cart.subtotal,
    discountAmount: cart.discountAmount,
    total: cart.total,
    couponId: cart.couponId,
    expiresAt: cart.expiresAt?.toISOString() ?? null,
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt?.toISOString() ?? null,
  };
}

function mapCartLineToResponse(line: any) {
  return {
    id: line.id,
    cartId: line.cartId,
    productId: line.productId,
    variantId: line.variantId,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    createdAt: line.createdAt.toISOString(),
    updatedAt: line.updatedAt?.toISOString() ?? null,
  };
}

@Controller("cart")
export class CartController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly updateCartLineUseCase: UpdateCartLineUseCase,
    private readonly removeCartLineUseCase: RemoveCartLineUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly applyCouponUseCase: ApplyCouponUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addToCart(@Body() dto: AddToCartDto) {
    const result = await this.addToCartUseCase.execute(dto);
    return {
      cart: mapCartToResponse(result.cart),
      cartLine: mapCartLineToResponse(result.cartLine),
      isNewCart: result.isNewCart,
    };
  }

  @Put("lines/:lineId")
  async updateCartLine(
    @Param("lineId", ParseUUIDPipe) lineId: string,
    @Body() dto: UpdateCartLineDto,
  ) {
    dto.cartLineId = lineId;
    const result = await this.updateCartLineUseCase.execute(dto);
    return {
      cart: mapCartToResponse(result.cart),
      cartLine: mapCartLineToResponse(result.cartLine),
    };
  }

  @Delete("lines/:lineId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCartLine(@Param("lineId", ParseUUIDPipe) lineId: string) {
    await this.removeCartLineUseCase.execute({ cartLineId: lineId });
  }

  @Get(":cartId")
  async getCart(@Param("cartId", ParseUUIDPipe) cartId: string) {
    const result = await this.getCartUseCase.execute({ cartId });
    return {
      cart: mapCartToResponse(result.cart),
      lines: result.lines.map(mapCartLineToResponse),
    };
  }

  @Post(":cartId/coupon")
  async applyCoupon(
    @Param("cartId", ParseUUIDPipe) cartId: string,
    @Body() dto: ApplyCouponDto,
  ) {
    dto.cartId = cartId;
    const result = await this.applyCouponUseCase.execute(dto);
    return {
      cart: mapCartToResponse(result.cart),
      discountAmount: result.discountAmount,
    };
  }
}
