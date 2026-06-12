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
  @ApiOperation({ summary: 'Registrar evento para un registro' })
  @ApiResponse({ status: 201, type: () => RecordEventResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
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
  @ApiOperation({ summary: 'Listar eventos de un registro' })
  @ApiResponse({ status: 200, type: [RecordEventResponseDto] })
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