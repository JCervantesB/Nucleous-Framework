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
  @ApiOperation({
    summary: 'Crear actividad',
    description:
      'Crea una nueva actividad (tarea, llamada, reunión, etc.) asociada al negocio actual. Por defecto se asigna al usuario que la crea. Puede asociarse a un registro específico (contact, lead, etc.) mediante relatedTable y relatedId.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Actividad creada exitosamente. Retorna los datos de la actividad creada.',
    type: () => ActivityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - El título y tipo son requeridos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o ausente.',
  })
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
  @ApiOperation({
    summary: 'Completar actividad',
    description:
      'Marca una actividad como completada. Solo el usuario asignado o el creador pueden marcar como completada una actividad.',
  })
  @ApiResponse({
    status: 200,
    description: 'Actividad marcada como completada exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'Actividad no encontrada.' })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o ausente.',
  })
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
  @ApiOperation({
    summary: 'Listar actividades por registro',
    description:
      'Retorna todas las actividades asociadas a un registro específico. Por ejemplo: todas las actividades de un contacto, lead, etc. El registro se identifica por table (nombre de la tabla) y recordId (UUID del registro).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de actividades del registro. Retorna un array con los datos de cada actividad.',
    type: [ActivityResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o ausente.',
  })
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

    return result.data.map((a) => ({
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
  @ApiOperation({
    summary: 'Listar actividades del usuario actual',
    description:
      'Retorna las actividades asignadas al usuario autenticado. Opcionalmente filtra por estado: PENDING (pendientes), DONE (completadas), CANCELLED (canceladas). Útil para dashboards y listas de tareas.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Lista de actividades del usuario. Retorna un array con los datos de cada actividad.',
    type: [ActivityResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o ausente.',
  })
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

    return result.data.map((a) => ({
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
