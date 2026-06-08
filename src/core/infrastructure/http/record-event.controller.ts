import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AddRecordEventUseCase } from '../../domain/record-event/use-cases/add-record-event.use-case.js';
import { ListRecordEventsUseCase } from '../../domain/record-event/use-cases/list-record-events.use-case.js';
import { CurrentBusinessService } from '../../application/current-business.service.js';

class AddRecordEventDto {
  type!: string;
  message!: string;
}

@Controller('core/events')
export class RecordEventController {
  constructor(
    private readonly addRecordEventUseCase: AddRecordEventUseCase,
    private readonly listRecordEventsUseCase: ListRecordEventsUseCase,
    private readonly currentBusiness: CurrentBusinessService,
  ) {}

  @Post(':table/:id')
  async addEvent(
    @Param('table') table: string,
    @Param('id') recordId: string,
    @Body() body: AddRecordEventDto,
    @Req() req: Request,
  ) {
    const userId = req.user?.id ?? null;
    const businessId = this.currentBusiness.getBusinessId();

    const event = await this.addRecordEventUseCase.execute({
      businessId,
      userId,
      relatedTable: table,
      relatedId: recordId,
      type: body.type,
      message: body.message,
    });

    return {
      id: event.id,
      type: event.type,
      message: event.message,
      userId: event.userId,
      createdAt: event.createdAt,
    };
  }

  @Get(':table/:id')
  async listEvents(
    @Param('table') table: string,
    @Param('id') recordId: string,
  ) {
    const businessId = this.currentBusiness.getBusinessId();

    return this.listRecordEventsUseCase.execute({
      businessId,
      relatedTable: table,
      relatedId: recordId,
    });
  }
}
