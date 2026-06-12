import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GetConfigParameterUseCase } from '../../domain/config-parameter/use-cases/get-config-parameter.use-case.js';
import { SetConfigParameterUseCase } from '../../domain/config-parameter/use-cases/set-config-parameter.use-case.js';
import { ListConfigParametersUseCase } from '../../domain/config-parameter/use-cases/list-config-parameters.use-case.js';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import { ConfigParameterDto, ConfigParameterResponseDto } from './dto/core.dtos';

@ApiTags('Core - Config')
@ApiBearerAuth()
@Controller('core/config')
export class ConfigController {
  constructor(
    private readonly getConfigUseCase: GetConfigParameterUseCase,
    private readonly setConfigUseCase: SetConfigParameterUseCase,
    private readonly listConfigParametersUseCase: ListConfigParametersUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar parámetros de configuración' })
  @ApiResponse({ status: 200, type: [ConfigParameterResponseDto] })
  async list(@CurrentBusinessId() businessId: string) {
    const result = await this.listConfigParametersUseCase.execute(businessId);

    return result.data.map((param: any) => ({
      key: param.key,
      value: param.value,
      description: param.description,
      updatedAt: param.updatedAt,
    })) as ConfigParameterResponseDto[];
  }

  @Get(':key')
  @ApiOperation({ summary: 'Obtener valor de un parámetro' })
  @ApiResponse({ status: 200, type: () => ConfigParameterResponseDto })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  async get(
    @CurrentBusinessId() businessId: string,
    @Param('key') key: string,
  ) {
    const result = await this.getConfigUseCase.execute({
      key,
      businessId,
    });

    if (!result.value) {
      throw new Error('Parámetro no encontrado');
    }

    return {
      key,
      value: result.value,
    } as ConfigParameterResponseDto;
  }

  @Post()
  @ApiOperation({ summary: 'Establecer valor de un parámetro' })
  @ApiResponse({ status: 200, type: () => ConfigParameterResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async set(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Body() dto: ConfigParameterDto,
  ) {
    const result = await this.setConfigUseCase.execute({
      key: dto.key,
      value: dto.value,
      businessId,
      userId,
    });

    return {
      key: result.configParameter.key,
      value: result.configParameter.value,
    } as ConfigParameterResponseDto;
  }
}