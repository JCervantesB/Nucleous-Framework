import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import type { Request } from "express";
import { GetConfigParameterUseCase } from "../../domain/config-parameter/use-cases/get-config-parameter.use-case.js";
import { SetConfigParameterUseCase } from "../../domain/config-parameter/use-cases/set-config-parameter.use-case.js";
import { DrizzleConfigParameterRepository } from "../persistence/drizzle-config-parameter.repository.js";
import { CurrentBusinessService } from "../../application/current-business.service.js";

class SetConfigDto {
  key: string;
  value: string;
}

@Controller("core/config")
export class ConfigController {
  private readonly configRepo = new DrizzleConfigParameterRepository();
  private readonly getConfigUseCase = new GetConfigParameterUseCase(this.configRepo);
  private readonly setConfigUseCase = new SetConfigParameterUseCase(this.configRepo);

  constructor(private readonly currentBusiness: CurrentBusinessService) {}

  @Get()
  async list(@Query("businessId") businessIdQuery: string | undefined) {
    let businessId = businessIdQuery;
    if (!businessId) {
      try {
        businessId = this.currentBusiness.getBusinessId();
      } catch {
        const globalParams = await this.configRepo.listGlobal();
        return {
          data: globalParams.map((param) => ({
            id: param.id,
            key: param.key,
            value: param.value,
          })),
        };
      }
    }

    const params = await this.configRepo.listByBusiness(businessId!);
    return {
      data: params.map((param) => ({
        id: param.id,
        key: param.key,
        value: param.value,
        businessId: param.businessId,
      })),
    };
  }

  @Get(":key")
  async get(@Param("key") key: string, @Query("businessId") businessIdQuery: string | undefined) {
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
  async set(@Body() body: SetConfigDto, @Req() req: Request, @Query("businessId") businessIdQuery: string | undefined) {
    const userId = (req as any).user?.id ?? undefined;
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