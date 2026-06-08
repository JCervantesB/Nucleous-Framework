import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { CreateContactUseCase } from '../../domain/contacts/use-cases/create-contact.use-case.js';
import { ListContactsUseCase } from '../../domain/contacts/use-cases/list-contacts.use-case.js';
import { CurrentBusinessService } from '../../application/current-business.service.js';

class CreateContactDto {
  type!: 'PERSON' | 'COMPANY';
  name!: string;
  email?: string;
  phone?: string;
  taxId?: string;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isEmployee?: boolean;
}

@Controller('core/contacts')
export class ContactController {
  constructor(
    private readonly createContactUseCase: CreateContactUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly currentBusiness: CurrentBusinessService,
  ) {}

  @Post()
  async create(@Body() body: CreateContactDto, @Req() req: Request) {
    const userId = req.user?.id ?? 'system';
    const businessId = this.currentBusiness.getBusinessId();

    const result = await this.createContactUseCase.execute({
      businessId,
      userId,
      type: body.type,
      name: body.name,
      email: body.email,
      phone: body.phone,
      taxId: body.taxId,
      isCustomer: body.isCustomer,
      isSupplier: body.isSupplier,
      isEmployee: body.isEmployee,
    });

    return {
      id: result.contact.id,
      name: result.contact.name,
      type: result.contact.type,
      email: result.contact.email,
      phone: result.contact.phone,
    };
  }

  @Get()
  async list(
    @Query('search') search: string | undefined,
    @Query('isCustomer') isCustomerRaw: string | undefined,
    @Query('isSupplier') isSupplierRaw: string | undefined,
    @Query('isEmployee') isEmployeeRaw: string | undefined,
    @Query('page') pageRaw: string | undefined,
    @Query('pageSize') pageSizeRaw: string | undefined,
  ) {
    const businessId = this.currentBusiness.getBusinessId();
    const page = Number(pageRaw) || 1;
    const pageSize = Number(pageSizeRaw) || 20;

    const isCustomer =
      isCustomerRaw === 'true'
        ? true
        : isCustomerRaw === 'false'
          ? false
          : undefined;
    const isSupplier =
      isSupplierRaw === 'true'
        ? true
        : isSupplierRaw === 'false'
          ? false
          : undefined;
    const isEmployee =
      isEmployeeRaw === 'true'
        ? true
        : isEmployeeRaw === 'false'
          ? false
          : undefined;

    const result = await this.listContactsUseCase.execute({
      businessId,
      search,
      isCustomer,
      isSupplier,
      isEmployee,
      page,
      pageSize,
    });

    return {
      data: result.data.map((contact) => ({
        id: contact.id,
        name: contact.name,
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        isCustomer: contact.isCustomer,
        isSupplier: contact.isSupplier,
        isEmployee: contact.isEmployee,
      })),
      pagination: {
        page,
        pageSize,
        total: result.total,
      },
    };
  }
}
