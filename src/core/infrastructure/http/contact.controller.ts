import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateContactUseCase } from '../../domain/contacts/use-cases/create-contact.use-case.js';
import { ListContactsUseCase } from '../../domain/contacts/use-cases/list-contacts.use-case.js';
import { UpdateContactUseCase } from '../../domain/contacts/use-cases/update-contact.use-case.js';
import { CurrentBusinessId } from '../../../common/decorators/business-id.decorator';
import { CurrentUserId } from '../../../common/decorators/user-id.decorator';
import { CreateContactDto, UpdateContactDto, ContactResponseDto } from './dto/core.dtos';

@ApiTags('Core - Contacts')
@ApiBearerAuth()
@Controller('core/contacts')
export class ContactController {
  constructor(
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly updateContactUseCase: UpdateContactUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear contacto',
    description: 'Crea un nuevo contacto asociado al negocio actual. El contacto se liga automáticamente al businessId extraído del token JWT del usuario autenticado.',
  })
  @ApiResponse({
    status: 201,
    description: 'Contacto creado exitosamente. Retorna los datos del contacto creado.',
    type: () => ContactResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos - El email es requerido o tiene formato incorrecto.' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async create(
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Body() dto: CreateContactDto,
  ) {
    const name = dto.firstName && dto.lastName 
      ? `${dto.firstName} ${dto.lastName}` 
      : (dto.firstName ?? 'Unknown');

    const result = await this.createContactUseCase.execute({
      businessId,
      userId,
      type: 'PERSON',
      name,
      email: dto.email,
      phone: dto.phone,
      isCustomer: dto.isCustomer,
      isSupplier: dto.isSupplier,
      isEmployee: dto.isEmployee,
    });

    return {
      id: result.contact.id,
      firstName: dto.firstName,
      lastName: dto.lastName ?? '',
      email: result.contact.email,
      phone: result.contact.phone,
      isCustomer: result.contact.isCustomer,
      isSupplier: result.contact.isSupplier,
      isEmployee: result.contact.isEmployee,
      createdAt: result.contact.createdAt,
    } as ContactResponseDto;
  }

  @Get()
  @ApiOperation({
    summary: 'Listar contactos',
    description: 'Retorna una lista paginada de contactos del negocio actual. Soporta búsqueda por texto en nombre o email y filtrado por rol (isCustomer, isSupplier, isEmployee). El businessId se extrae automáticamente del token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contactos obtenida exitosamente. Incluye datos de paginación: total, page, pageSize, totalPages.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado - Token JWT inválido o ausente.' })
  async list(
    @CurrentBusinessId() businessId: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 20;

    const options: {
      search?: string;
      isCustomer?: boolean;
      isSupplier?: boolean;
      isEmployee?: boolean;
      page: number;
      pageSize: number;
    } = {
      page: pageNum,
      pageSize: pageSizeNum,
    };

    if (search) {
      options.search = search;
    }

    if (role === 'customer') {
      options.isCustomer = true;
    } else if (role === 'supplier') {
      options.isSupplier = true;
    } else if (role === 'employee') {
      options.isEmployee = true;
    }

    const result = await this.listContactsUseCase.execute({
      businessId,
      ...options,
    });

    return {
      data: result.data.map((contact) => ({
        id: contact.id,
        firstName: contact.name.split(' ')[0] ?? contact.name,
        lastName: contact.name.split(' ').slice(1).join(' ') || '',
        email: contact.email,
        phone: contact.phone,
        isCustomer: contact.isCustomer,
        isSupplier: contact.isSupplier,
        isEmployee: contact.isEmployee,
        createdAt: contact.createdAt,
      })) as ContactResponseDto[],
      total: result.total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(result.total / pageSizeNum),
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar contacto',
    description: 'Actualiza los datos de un contacto existente. Soporta actualización de flags de rol (isCustomer, isSupplier, isEmployee).',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacto actualizado exitosamente.',
    type: () => ContactResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contacto no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentBusinessId() businessId: string,
    @CurrentUserId() userId: string,
    @Body() dto: UpdateContactDto,
  ) {
    const fullName = dto.firstName && dto.lastName
      ? `${dto.firstName} ${dto.lastName}`
      : dto.firstName;

    const result = await this.updateContactUseCase.execute({
      id,
      businessId,
      userId,
      name: fullName,
      email: dto.email,
      phone: dto.phone,
      isCustomer: dto.isCustomer,
      isSupplier: dto.isSupplier,
      isEmployee: dto.isEmployee,
    });

    if (!result.contact) {
      throw new Error('Contacto no encontrado');
    }

    return {
      id: result.contact.id,
      firstName: result.contact.name.split(' ')[0] ?? result.contact.name,
      lastName: result.contact.name.split(' ').slice(1).join(' ') || '',
      email: result.contact.email,
      phone: result.contact.phone,
      isCustomer: result.contact.isCustomer,
      isSupplier: result.contact.isSupplier,
      isEmployee: result.contact.isEmployee,
      createdAt: result.contact.createdAt,
      updatedAt: result.contact.updatedAt,
    } as ContactResponseDto;
  }
}