import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateBusinessUseCase } from '../../domain/use-cases/create-business.use-case.js';
import { GetBusinessUseCase } from '../../domain/use-cases/get-business.use-case.js';
import { CreateBusinessDto, BusinessResponseDto } from './dto/core.dtos';

@ApiTags('Core - Business')
@ApiBearerAuth()
@Controller('core/business')
export class BusinessController {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly getBusinessUseCase: GetBusinessUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo negocio',
    description:
      'Crea un nuevo negocio (business) en el sistema. El negocio es la entidad principal para la arquitectura multi-tenant. Cada negocio puede tener sus propios contactos, actividades, emails y archivos.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Negocio creado exitosamente. Retorna los datos completos del negocio.',
    type: () => BusinessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos inválidos - El nombre es requerido, el slug debe ser único.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o ausente.',
  })
  async create(@Body() dto: CreateBusinessDto) {
    const result = await this.createBusinessUseCase.execute({
      name: dto.name,
      slug: dto.slug,
      legalName: dto.legalName,
      countryCode: dto.countryCode,
      timezone: dto.timezone,
      currencyCode: dto.currencyCode,
      publicName: dto.publicName,
    });

    return {
      id: result.business.id,
      name: result.business.name,
      slug: result.business.slug,
      legalName: result.business.legalName,
      countryCode: result.business.countryCode,
      timezone: result.business.timezone,
      currencyCode: result.business.currencyCode,
      publicName: result.business.publicName,
      isActive: result.business.isActive,
    } as BusinessResponseDto;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener negocio por ID',
    description:
      'Retorna los datos de un negocio específico. El negocio está asociado al usuario autenticado en el token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Negocio encontrado. Retorna los datos del negocio.',
    type: () => BusinessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'Negocio no encontrado - El ID no existe o no pertenece al usuario.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o ausente.',
  })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.getBusinessUseCase.execute({ id });

    if (!result.business) {
      throw new Error('Negocio no encontrado');
    }

    const business = result.business;
    return {
      id: business.id,
      name: business.name,
      legalName: business.legalName,
      slug: business.slug,
      countryCode: business.countryCode,
      timezone: business.timezone,
      currencyCode: business.currencyCode,
      publicName: business.publicName,
      isActive: business.isActive,
    } as BusinessResponseDto;
  }
}
