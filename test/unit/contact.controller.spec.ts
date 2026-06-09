import { ContactController } from '../../src/core/infrastructure/http/contact.controller';
import { CreateContactUseCase } from '../../src/core/domain/contacts/use-cases/create-contact.use-case';
import { ListContactsUseCase } from '../../src/core/domain/contacts/use-cases/list-contacts.use-case';
import { CurrentBusinessService } from '../../src/core/application/current-business.service';
import { Contact } from '../../src/core/domain/contacts/contact.entity';

describe('ContactController (Unit)', () => {
  let controller: ContactController;
  let mockCreateContactUseCase: jest.Mocked<CreateContactUseCase>;
  let mockListContactsUseCase: jest.Mocked<ListContactsUseCase>;
  let mockCurrentBusiness: jest.Mocked<CurrentBusinessService>;

  beforeEach(() => {
    mockCreateContactUseCase = {
      execute: jest.fn(),
    } as any;

    mockListContactsUseCase = {
      execute: jest.fn(),
    } as any;

    mockCurrentBusiness = {
      getBusinessId: jest.fn().mockReturnValue('biz-123'),
    } as any;

    controller = new ContactController(
      mockCreateContactUseCase,
      mockListContactsUseCase,
      mockCurrentBusiness,
    );
  });

  describe('create', () => {
    it('debe crear un contacto y retornar sus datos', async () => {
      const mockContact = Contact.create({
        businessId: 'biz-123',
        type: 'PERSON',
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '+5215512345678',
      }) as any;
      mockCreateContactUseCase.execute.mockResolvedValue({ contact: mockContact });

      const result = await controller.create(
        {
          type: 'PERSON',
          name: 'Juan Perez',
          email: 'juan@example.com',
          phone: '+5215512345678',
        },
        { user: { id: 'user-123' } } as any,
      );

      expect(result.id).toBe(mockContact.id);
      expect(result.name).toBe('Juan Perez');
      expect(result.email).toBe('juan@example.com');
    });

    it('debe usar userId del request', async () => {
      const mockContact = Contact.create({
        businessId: 'biz-123',
        type: 'PERSON',
        name: 'Test',
      }) as any;
      mockCreateContactUseCase.execute.mockResolvedValue({ contact: mockContact });

      await controller.create(
        { type: 'PERSON', name: 'Test' },
        { user: { id: 'custom-user-id' } } as any,
      );

      expect(mockCreateContactUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'custom-user-id' }),
      );
    });

    it('debe usar system como userId por defecto', async () => {
      const mockContact = Contact.create({
        businessId: 'biz-123',
        type: 'PERSON',
        name: 'Test',
      }) as any;
      mockCreateContactUseCase.execute.mockResolvedValue({ contact: mockContact });

      await controller.create(
        { type: 'PERSON', name: 'Test' },
        { user: undefined } as any,
      );

      expect(mockCreateContactUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'system' }),
      );
    });
  });

  describe('list', () => {
    it('debe listar contactos con paginacion por defecto', async () => {
      const mockContacts = [
        Contact.create({ businessId: 'biz-123', type: 'PERSON', name: 'Juan' }) as any,
        Contact.create({ businessId: 'biz-123', type: 'COMPANY', name: 'Acme' }) as any,
      ];
      mockListContactsUseCase.execute.mockResolvedValue({
        data: mockContacts,
        total: 2,
      });

      const result = await controller.list(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(20);
    });

    it('debe usar businessId del CurrentBusinessService', async () => {
      mockListContactsUseCase.execute.mockResolvedValue({ data: [], total: 0 });

      await controller.list(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      expect(mockCurrentBusiness.getBusinessId).toHaveBeenCalled();
    });

    it('debe parsear query params correctamente', async () => {
      mockListContactsUseCase.execute.mockResolvedValue({ data: [], total: 0 });

      await controller.list(
        'Juan',
        'true',
        'false',
        undefined,
        '2',
        '10',
      );

      expect(mockListContactsUseCase.execute).toHaveBeenCalledWith({
        businessId: 'biz-123',
        search: 'Juan',
        isCustomer: true,
        isSupplier: false,
        isEmployee: undefined,
        page: 2,
        pageSize: 10,
      });
    });
  });
});