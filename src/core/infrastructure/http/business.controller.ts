import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { Request } from 'express';
import { CreateBusinessUseCase } from '../../domain/use-cases/create-business.use-case.js';
import { DrizzleBusinessRepository } from '../persistence/drizzle-business.repository.js';

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
  private readonly createBusinessUseCase: CreateBusinessUseCase;

  constructor() {
    const businessRepo = new DrizzleBusinessRepository();
    this.createBusinessUseCase = new CreateBusinessUseCase(businessRepo);
  }

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
    const businessRepo = new DrizzleBusinessRepository();
    const business = await businessRepo.findById(id);

    if (!business) {
      return { error: 'Business not found' };
    }

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
