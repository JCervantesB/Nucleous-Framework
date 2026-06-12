import { Body, Controller, Get, Param, Post, ParseUUIDPipe } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Crear un nuevo negocio' })
  @ApiResponse({ status: 201, type: () => BusinessResponseDto, description: 'Negocio creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
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
  @ApiOperation({ summary: 'Obtener negocio por ID' })
  @ApiResponse({ status: 200, type: () => BusinessResponseDto })
  @ApiResponse({ status: 404, description: 'Negocio no encontrado' })
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