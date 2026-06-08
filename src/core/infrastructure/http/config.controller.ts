import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { GetConfigParameterUseCase } from '../../domain/config-parameter/use-cases/get-config-parameter.use-case.js';
import { SetConfigParameterUseCase } from '../../domain/config-parameter/use-cases/set-config-parameter.use-case.js';
import { ListConfigParametersUseCase } from '../../domain/config-parameter/use-cases/list-config-parameters.use-case.js';
import { CurrentBusinessService } from '../../application/current-business.service.js';

class SetConfigDto {
  key!: string;
  value!: string;
}

@Controller('core/config')
export class ConfigController {
  constructor(
    private readonly getConfigUseCase: GetConfigParameterUseCase,
    private readonly setConfigUseCase: SetConfigParameterUseCase,
    private readonly listConfigParametersUseCase: ListConfigParametersUseCase,
    private readonly currentBusiness: CurrentBusinessService,
  ) {}

  @Get()
  async list(@Query('businessId') businessIdQuery: string | undefined) {
    let businessId = businessIdQuery;
    if (!businessId) {
      try {
        businessId = this.currentBusiness.getBusinessId();
      } catch {
        return this.listConfigParametersUseCase.execute(undefined);
      }
    }
    return this.listConfigParametersUseCase.execute(businessId);
  }

  @Get(':key')
  async get(
    @Param('key') key: string,
    @Query('businessId') businessIdQuery: string | undefined,
  ) {
    let businessId = businessIdQuery;
    if (!businessId) {
      try {
        businessId = this.currentBusiness.getBusinessId();
      } catch {
        businessId = undefined;
      }
    }

    const result = await this.getConfigUseCase.execute({
      key,
      businessId,
    });

    return { value: result.value };
  }

  @Post()
  async set(
    @Body() body: SetConfigDto,
    @Req() req: Request,
    @Query('businessId') businessIdQuery: string | undefined,
  ) {
    const userId = req.user?.id ?? undefined;
    let businessId = businessIdQuery;
    if (!businessId) {
      try {
        businessId = this.currentBusiness.getBusinessId();
      } catch {
        businessId = undefined;
      }
    }

    const result = await this.setConfigUseCase.execute({
      key: body.key,
      value: body.value,
      businessId,
      userId,
    });

    return {
      id: result.configParameter.id,
      key: result.configParameter.key,
      value: result.configParameter.value,
    };
  }
}
