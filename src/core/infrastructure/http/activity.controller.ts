import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateActivityUseCase } from '../../domain/activity/use-cases/create-activity.use-case.js';
import { CompleteActivityUseCase } from '../../domain/activity/use-cases/complete-activity.use-case.js';
import { ListActivitiesForRecordUseCase } from '../../domain/activity/use-cases/list-activities-for-record.use-case.js';
import { ListActivitiesForUserUseCase } from '../../domain/activity/use-cases/list-activities-for-user.use-case.js';
import { CurrentBusinessService } from '../../application/current-business.service.js';

class CreateActivityDto {
  assignedUserId!: string;
  relatedTable!: string;
  relatedId!: string;
  type!: string;
  title!: string;
  note?: string;
  dueDate?: string;
  isPinned?: boolean;
}

@Controller('core/activities')
export class ActivityController {
  constructor(
    private readonly createActivityUseCase: CreateActivityUseCase,
    private readonly completeActivityUseCase: CompleteActivityUseCase,
    private readonly listActivitiesForRecordUseCase: ListActivitiesForRecordUseCase,
    private readonly listActivitiesForUserUseCase: ListActivitiesForUserUseCase,
    private readonly currentBusiness: CurrentBusinessService,
  ) {}

  @Post()
  async create(@Body() body: CreateActivityDto, @Req() req: Request) {
    const creatorUserId = req.user?.id ?? 'system';
    const businessId = this.currentBusiness.getBusinessId();
    const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;

    const activity = await this.createActivityUseCase.execute({
      businessId,
      creatorUserId,
      assignedUserId: body.assignedUserId,
      relatedTable: body.relatedTable,
      relatedId: body.relatedId,
      type: body.type,
      title: body.title,
      note: body.note,
      dueDate,
      isPinned: body.isPinned,
    });

    return {
      id: activity.id,
      title: activity.title,
      type: activity.type,
      status: activity.status,
      dueDate: activity.dueDate,
      relatedTable: activity.relatedTable,
      relatedId: activity.relatedId,
    };
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id ?? 'system';
    const businessId = this.currentBusiness.getBusinessId();

    await this.completeActivityUseCase.execute({
      businessId,
      activityId: id,
      userId,
    });

    return { success: true };
  }

  @Get('record/:table/:recordId')
  async listForRecord(
    @Param('table') table: string,
    @Param('recordId') recordId: string,
    @Query('status') status: 'PENDING' | 'DONE' | 'CANCELLED' | undefined,
  ) {
    const businessId = this.currentBusiness.getBusinessId();

    return this.listActivitiesForRecordUseCase.execute({
      businessId,
      relatedTable: table,
      relatedId: recordId,
      status,
    });
  }

  @Get('me')
  async listForCurrentUser(
    @Req() req: Request,
    @Query('status') status: 'PENDING' | 'DONE' | 'CANCELLED' | undefined,
  ) {
    const userId = req.user?.id ?? 'system';
    const businessId = this.currentBusiness.getBusinessId();

    return this.listActivitiesForUserUseCase.execute({
      businessId,
      userId,
      status,
    });
  }
}
