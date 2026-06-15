import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { CreateUnitMeasureUseCase } from '../../application/use-cases/create-unit-measure.use-case';
import { UpdateUnitMeasureUseCase } from '../../application/use-cases/update-unit-measure.use-case';
import { DeleteUnitMeasureUseCase } from '../../application/use-cases/delete-unit-measure.use-case';
import { ListUnitMeasuresUseCase } from '../../application/use-cases/list-unit-measures.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import {
  CreateUnitMeasureDto,
  UpdateUnitMeasureDto,
  UnitMeasureResponseDto,
  UnitMeasureListResponseDto,
} from './dto/unit-measure.dtos';

@ApiTags('Products - Unit Measures')
@ApiBearerAuth()
@ApiExtraModels(UnitMeasureResponseDto, UnitMeasureListResponseDto)
@Controller('product-unit-measures')
export class UnitMeasureController {
  constructor(
    private readonly createUnitMeasureUseCase: CreateUnitMeasureUseCase,
    private readonly updateUnitMeasureUseCase: UpdateUnitMeasureUseCase,
    private readonly deleteUnitMeasureUseCase: DeleteUnitMeasureUseCase,
    private readonly listUnitMeasuresUseCase: ListUnitMeasuresUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear unidad de medida',
    description: 'Crea una nueva unidad de medida.',
  })
  @ApiResponse({
    status: 201,
    description: 'Unidad creada exitosamente',
    type: () => UnitMeasureResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateUnitMeasureDto,
  ) {
    const result = await this.createUnitMeasureUseCase.execute({
      businessId,
      name: dto.name,
      abbreviation: dto.abbreviation,
      type: dto.type,
      conversionFactor: dto.conversionFactor,
      isDefault: dto.isDefault,
    });

    return result.unitMeasure;
  }

  @Get()
  @ApiOperation({
    summary: 'Listar unidades de medida',
    description: 'Lista todas las unidades de medida del negocio.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de unidades',
    type: () => UnitMeasureListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(@CurrentBusinessId() businessId: string) {
    const result = await this.listUnitMeasuresUseCase.execute({ businessId });
    return { data: result.data };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar unidad de medida',
    description: 'Actualiza una unidad de medida existente.',
  })
  @ApiResponse({ status: 200, description: 'Unidad actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Unidad no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
    @Body() dto: UpdateUnitMeasureDto,
  ) {
    await this.updateUnitMeasureUseCase.execute({
      id,
      businessId,
      name: dto.name,
      abbreviation: dto.abbreviation,
      type: dto.type,
      conversionFactor: dto.conversionFactor,
      isDefault: dto.isDefault,
    });
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar unidad de medida',
    description: 'Elimina una unidad de medida.',
  })
  @ApiResponse({ status: 200, description: 'Unidad eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Unidad no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    await this.deleteUnitMeasureUseCase.execute({ id, businessId });
    return { success: true };
  }
}
