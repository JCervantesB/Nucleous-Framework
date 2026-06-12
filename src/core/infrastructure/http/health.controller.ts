import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verificar estado del servicio' })
  @ApiResponse({ status: 200, description: 'Servicio healthy' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}