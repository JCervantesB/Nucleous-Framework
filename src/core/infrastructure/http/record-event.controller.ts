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
import { AddRecordEventUseCase } from '../../domain/record-event/use-cases/add-record-event.use-case.js';
import { ListRecordEventsUseCase } from '../../domain/record-event/use-cases/list-record-events.use-case.js';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import { RecordEventDto, RecordEventResponseDto } from './dto/core.dtos';

@ApiTags('Core - Record Events')
@ApiBearerAuth()
@Controller('core/record-events')
export class RecordEventController {
  constructor(
    private readonly addRecordEventUseCase: AddRecordEventUseCase,
    private readonly listRecordEventsUseCase: ListRecordEventsUseCase,
  ) {}

  @Post(':table/:id')
  @ApiOperation({
    summary: 'Registrar evento para un registro',
    description: 'Registra un evento de auditoría asociado a un registro específico (contact, business, etc.). Útil para tracking de cambios, actividades de usuario, logs de acciones. El evento se liga al businessId y userId del usuario autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Evento registrado exitosamente. Retorna los datos del evento creado.',
    type: () => RecordEventResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos - Tipo de evento es requerido.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async addEvent(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Param('table') table: string,
    @Param('id') recordId: string,
    @Body() dto: RecordEventDto,
  ) {
    const event = await this.addRecordEventUseCase.execute({
      businessId,
      userId,
      relatedTable: table,
      relatedId: recordId,
      type: dto.eventType,
      message: JSON.stringify(dto.metadata ?? {}),
    });

    return {
      id: event.id,
      eventType: event.type,
      entity: table,
      entityId: recordId,
      metadata: dto.metadata,
      createdAt: event.createdAt,
    } as RecordEventResponseDto;
  }

  @Get(':table/:id')
  @ApiOperation({
    summary: 'Listar eventos de un registro',
    description: 'Retorna el historial de eventos/auditoría de un registro específico. Permite ver todas las acciones realizadas sobre ese registro (creado, actualizado, eliminado, etc.).',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos obtenidos exitosamente. Retorna array de eventos.',
    type: [RecordEventResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async listEvents(
    @CurrentBusinessId() businessId: string,
    @Param('table') table: string,
    @Param('id') recordId: string,
  ) {
    const result = await this.listRecordEventsUseCase.execute({
      businessId,
      relatedTable: table,
      relatedId: recordId,
    });

    return result.data.map((event: any) => ({
      id: event.id,
      eventType: event.type,
      entity: table,
      entityId: recordId,
      metadata: {},
      createdAt: event.createdAt,
    })) as RecordEventResponseDto[];
  }
}