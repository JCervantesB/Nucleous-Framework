import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { AddRecordEventUseCase } from "../../domain/record-event/use-cases/add-record-event.use-case.js";
import { DrizzleRecordEventRepository } from "../persistence/drizzle-record-event.repository.js";
import { CurrentBusinessService } from "../../application/current-business.service.js";

class AddRecordEventDto {
  type: string;
  message: string;
}

@Controller("core/events")
export class RecordEventController {
  private readonly recordEventRepo = new DrizzleRecordEventRepository();
  private readonly addRecordEventUseCase = new AddRecordEventUseCase(this.recordEventRepo);

  constructor(private readonly currentBusiness: CurrentBusinessService) {}

  @Post(":table/:id")
  async addEvent(
    @Param("table") table: string,
    @Param("id") recordId: string,
    @Body() body: AddRecordEventDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.id ?? null;
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

  @Get(":table/:id")
  async listEvents(
    @Param("table") table: string,
    @Param("id") recordId: string,
  ) {
    const businessId = this.currentBusiness.getBusinessId();

    const events = await this.recordEventRepo.listForRecord({
      businessId,
      relatedTable: table,
      relatedId: recordId,
    });

    return {
      data: events.map((event) => ({
        id: event.id,
        type: event.type,
        message: event.message,
        userId: event.userId,
        createdAt: event.createdAt,
      })),
    };
  }
}