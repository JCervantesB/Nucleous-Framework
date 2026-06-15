import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { CreateLocationUseCase } from '../../application/use-cases/create-location.use-case';
import { ListLocationsUseCase } from '../../application/use-cases/list-locations.use-case';
import { UpdateLocationUseCase } from '../../application/use-cases/update-location.use-case';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import type { LocationType } from '../../domain/entities/inventory-location.entity';
import {
  CreateLocationDto,
  UpdateLocationDto,
  LocationResponseDto,
  LocationListResponseDto,
  ListLocationsQueryDto,
} from './dto/location.dtos';

@ApiTags('Inventory Locations')
@ApiBearerAuth()
@ApiExtraModels(LocationResponseDto, LocationListResponseDto)
@Controller('inventory/locations')
export class LocationController {
  constructor(
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly listLocationsUseCase: ListLocationsUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear ubicación',
    description: 'Crea una nueva ubicación de inventario.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ubicación creada exitosamente',
    type: () => LocationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o código duplicado',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(
    @CurrentBusinessId() businessId: string,
    @Body() dto: CreateLocationDto,
  ) {
    const address =
      dto.addressStreet ||
      dto.addressCity ||
      dto.addressState ||
      dto.addressPostalCode ||
      dto.addressCountryCode
        ? {
            street: dto.addressStreet,
            city: dto.addressCity,
            state: dto.addressState,
            postalCode: dto.addressPostalCode,
            countryCode: dto.addressCountryCode,
          }
        : undefined;

    const location = await this.createLocationUseCase.execute({
      businessId,
      code: dto.code,
      name: dto.name,
      type: dto.type as LocationType,
      contactId: dto.contactId,
      address,
    });

    return {
      id: location.id,
      code: location.code,
      name: location.name,
      type: location.type,
      contactId: location.contactId,
      addressStreet: location.address?.street ?? null,
      addressCity: location.address?.city ?? null,
      addressState: location.address?.state ?? null,
      addressPostalCode: location.address?.postalCode ?? null,
      addressCountryCode: location.address?.countryCode ?? null,
      isActive: location.isActive,
      isTransit: location.isTransit,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar ubicaciones',
    description: 'Lista ubicaciones de inventario con paginación y filtros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones',
    type: () => LocationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async list(
    @CurrentBusinessId() businessId: string,
    @Query() query: ListLocationsQueryDto,
  ) {
    const result = await this.listLocationsUseCase.execute({
      businessId,
      options: {
        page: query.page,
        pageSize: query.pageSize,
        type: query.type as LocationType, // string to LocationType cast
        isActive: query.isActive,
        search: query.search,
      },
    });

    return {
      data: result.data.map((location) => ({
        id: location.id,
        code: location.code,
        name: location.name,
        type: location.type,
        contactId: location.contactId,
        addressStreet: location.address?.street ?? null,
        addressCity: location.address?.city ?? null,
        addressState: location.address?.state ?? null,
        addressPostalCode: location.address?.postalCode ?? null,
        addressCountryCode: location.address?.countryCode ?? null,
        isActive: location.isActive,
        isTransit: location.isTransit,
        createdAt: location.createdAt,
        updatedAt: location.updatedAt,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar ubicación',
    description: 'Actualiza los datos de una ubicación existente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ubicación actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    const address =
      dto.addressStreet !== undefined ||
      dto.addressCity !== undefined ||
      dto.addressState !== undefined ||
      dto.addressPostalCode !== undefined ||
      dto.addressCountryCode !== undefined
        ? {
            street: dto.addressStreet,
            city: dto.addressCity,
            state: dto.addressState,
            postalCode: dto.addressPostalCode,
            countryCode: dto.addressCountryCode,
          }
        : undefined;

    await this.updateLocationUseCase.execute({
      id,
      businessId,
      code: dto.code,
      name: dto.name,
      type: dto.type as LocationType,
      contactId: dto.contactId,
      address,
      isActive: dto.isActive,
    });

    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar ubicación',
    description: 'Elimina lógicamente una ubicación (la desactiva).',
  })
  @ApiResponse({ status: 200, description: 'Ubicación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
  ) {
    await this.updateLocationUseCase.execute({
      id,
      businessId,
      isActive: false,
    });

    return { success: true };
  }
}
