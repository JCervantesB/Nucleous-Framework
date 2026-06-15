import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CreateMoveUseCase } from '../../application/use-cases/create-move.use-case';
import { ListMovesUseCase } from '../../application/use-cases/list-moves.use-case';
import { ConfirmMoveUseCase } from '../../application/use-cases/confirm-move.use-case';
import { CompleteMoveUseCase } from '../../application/use-cases/complete-move.use-case';
import { AdjustInventoryUseCase } from '../../application/use-cases/adjust-inventory.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import type {
  MoveType,
  MoveState,
} from '../../domain/entities/inventory-move.entity';
import {
  CreateMoveDto,
  MoveResponseDto,
  MoveListResponseDto,
  ListMovesQueryDto,
  AdjustInventoryDto,
} from './dto/move.dtos';

@ApiTags('Inventory Moves')
@ApiBearerAuth()
@ApiExtraModels(MoveResponseDto, MoveListResponseDto)
@Controller('inventory/moves')
export class MoveController {
  constructor(
    private readonly createMoveUseCase: CreateMoveUseCase,
    private readonly listMovesUseCase: ListMovesUseCase,
    private readonly confirmMoveUseCase: ConfirmMoveUseCase,
    private readonly completeMoveUseCase: CompleteMoveUseCase,
    private readonly adjustInventoryUseCase: AdjustInventoryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear movimiento',
    description: 'Crea un nuevo movimiento de inventario.',
  })
  @ApiResponse({
    status: 201,
    description: 'Movimiento creado exitosamente',
    type: () => MoveResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateMoveDto,
  ) {
    const result = await this.createMoveUseCase.execute({
      businessId,
      productId: dto.productId,
      variantId: dto.variantId,
      moveType: dto.moveType,
      quantity: dto.quantity,
      unitOfMeasureId: dto.unitOfMeasureId,
      fromLocationId: dto.fromLocationId,
      toLocationId: dto.toLocationId,
      reference: dto.reference,
      notes: dto.notes,
      externalId: dto.externalId,
      originTable: dto.originTable,
      originId: dto.originId,
    });

    return result.move;
  }

  @Get()
  @ApiOperation({
    summary: 'Listar movimientos',
    description: 'Lista movimientos de inventario con paginación y filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos',
    type: () => MoveListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(
    @CurrentBusinessId() businessId: string,
    @Query() query: ListMovesQueryDto,
  ) {
    const result = await this.listMovesUseCase.execute({
      businessId,
      options: {
        page: query.page,
        pageSize: query.pageSize,
        productId: query.productId,
        variantId: query.variantId,
        moveType: query.moveType as MoveType,
        state: query.state as MoveState,
        fromLocationId: query.fromLocationId,
        toLocationId: query.toLocationId,
        reference: query.reference,
      },
    });

    return {
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar movimiento',
    description: 'Confirma un movimiento en estado DRAFT.',
  })
  @ApiResponse({ status: 200, description: 'Movimiento confirmado' })
  @ApiResponse({ status: 400, description: 'No se puede confirmar' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    await this.confirmMoveUseCase.execute({ id, businessId });
    return { success: true };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar movimiento',
    description: 'Completa un movimiento en estado CONFIRMED.',
  })
  @ApiResponse({ status: 200, description: 'Movimiento completado' })
  @ApiResponse({ status: 400, description: 'No se puede completar' })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    await this.completeMoveUseCase.execute({ id, businessId });
    return { success: true };
  }

  @Post('adjust')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajuste de inventario',
    description: 'Realiza un ajuste de inventario directamente a DONE.',
  })
  @ApiResponse({ status: 201, description: 'Ajuste realizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async adjust(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string | null,
    @Body() dto: AdjustInventoryDto,
  ) {
    const result = await this.adjustInventoryUseCase.execute({
      businessId,
      productId: dto.productId,
      variantId: dto.variantId,
      locationId: dto.locationId,
      quantity: dto.quantity,
      unitOfMeasureId: dto.unitOfMeasureId,
      reason: dto.reason,
      notes: dto.notes,
      userId: userId ?? undefined,
    });

    return result;
  }
}
