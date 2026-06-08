import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateBusinessUseCase } from '../../domain/use-cases/create-business.use-case.js';
import { GetBusinessUseCase } from '../../domain/use-cases/get-business.use-case.js';

class CreateBusinessDto {
  name!: string;
  slug!: string;
  legalName?: string;
  countryCode?: string;
  timezone?: string;
  currencyCode?: string;
  publicName?: string;
}

@Controller('core/business')
export class BusinessController {
  constructor(
    private readonly createBusinessUseCase: CreateBusinessUseCase,
    private readonly getBusinessUseCase: GetBusinessUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateBusinessDto) {
    const result = await this.createBusinessUseCase.execute({
      name: body.name,
      slug: body.slug,
      legalName: body.legalName,
      countryCode: body.countryCode,
      timezone: body.timezone,
      currencyCode: body.currencyCode,
      publicName: body.publicName,
    });

    return {
      id: result.business.id,
      name: result.business.name,
      slug: result.business.slug,
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.getBusinessUseCase.execute({ id });

    if (!result.business) {
      return { error: 'Negocio no encontrado' };
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
    };
  }
}
