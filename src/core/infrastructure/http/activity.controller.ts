import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateActivityUseCase } from '../../domain/activity/use-cases/create-activity.use-case.js';
import { CompleteActivityUseCase } from '../../domain/activity/use-cases/complete-activity.use-case.js';
import { ListActivitiesForRecordUseCase } from '../../domain/activity/use-cases/list-activities-for-record.use-case.js';
import { ListActivitiesForUserUseCase } from '../../domain/activity/use-cases/list-activities-for-user.use-case.js';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import { CreateActivityDto, ActivityResponseDto } from './dto/core.dtos';

@ApiTags('Core - Activities')
@ApiBearerAuth()
@Controller('core/activities')
export class ActivityController {
  constructor(
    private readonly createActivityUseCase: CreateActivityUseCase,
    private readonly completeActivityUseCase: CompleteActivityUseCase,
    private readonly listActivitiesForRecordUseCase: ListActivitiesForRecordUseCase,
    private readonly listActivitiesForUserUseCase: ListActivitiesForUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear actividad' })
  @ApiResponse({ status: 201, type: () => ActivityResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Body() dto: CreateActivityDto,
  ) {
    const activity = await this.createActivityUseCase.execute({
      businessId,
      creatorUserId: userId,
      assignedUserId: dto.assignedUserId ?? userId,
      relatedTable: dto.relatedTable ?? 'general',
      relatedId: dto.relatedId ?? '',
      type: dto.activityType,
      title: dto.title,
      note: dto.description,
    });

    return {
      id: activity.id,
      title: activity.title,
      activityType: activity.type,
      description: activity.note,
      recordId: activity.relatedId,
      assignedToId: activity.userId,
      completed: activity.status === 'DONE',
      createdAt: activity.createdAt,
    } as ActivityResponseDto;
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completar actividad' })
  @ApiResponse({ status: 200, description: 'Actividad completada' })
  async complete(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.completeActivityUseCase.execute({
      businessId,
      activityId: id,
      userId,
    });

    return { success: true };
  }

  @Get('record/:table/:recordId')
  @ApiOperation({ summary: 'Listar actividades por registro' })
  @ApiResponse({ status: 200, type: [ActivityResponseDto] })
  async listForRecord(
    @CurrentBusinessId() businessId: string,
    @Param('table') table: string,
    @Param('recordId') recordId: string,
  ) {
    const result = await this.listActivitiesForRecordUseCase.execute({
      businessId,
      relatedTable: table,
      relatedId: recordId,
    });

    return result.data.map(a => ({
      id: a.id,
      title: a.title,
      activityType: a.type,
      description: a.note,
      recordId: a.relatedId,
      assignedToId: a.userId,
      completed: a.status === 'DONE',
      createdAt: a.createdAt,
    })) as ActivityResponseDto[];
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar actividades del usuario actual' })
  @ApiResponse({ status: 200, type: [ActivityResponseDto] })
  async listForCurrentUser(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Query('status') status?: 'PENDING' | 'DONE' | 'CANCELLED',
  ) {
    const result = await this.listActivitiesForUserUseCase.execute({
      businessId,
      userId,
      status,
    });

    return result.data.map(a => ({
      id: a.id,
      title: a.title,
      activityType: a.type,
      description: a.note,
      recordId: a.relatedId,
      assignedToId: a.userId,
      completed: a.status === 'DONE',
      createdAt: a.createdAt,
    })) as ActivityResponseDto[];
  }
}