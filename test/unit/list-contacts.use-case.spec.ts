import { ListContactsUseCase } from '../../src/core/domain/contacts/use-cases/list-contacts.use-case';
import { Contact } from '../../src/core/domain/contacts/contact.entity';
import type { ContactRepository } from '../../src/core/domain/contacts/contact.repository';

describe('ListContactsUseCase (Unit)', () => {
  let useCase: ListContactsUseCase;
  let mockRepo: jest.Mocked<ContactRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByBusiness: jest.fn(),
    } as any;
    useCase = new ListContactsUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe listar contactos con paginacion por defecto', async () => {
      const mockContacts = [
        Contact.create({ businessId: 'biz-1', type: 'PERSON', name: 'Juan' }) as any,
        Contact.create({ businessId: 'biz-1', type: 'COMPANY', name: 'Acme' }) as any,
      ];
      mockRepo.listByBusiness.mockResolvedValue({
        data: mockContacts,
        total: 2,
      });

      const result = await useCase.execute({ businessId: 'biz-1' });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockRepo.listByBusiness).toHaveBeenCalledWith('biz-1', {
        search: undefined,
        isCustomer: undefined,
        isSupplier: undefined,
        isEmployee: undefined,
        page: 1,
        pageSize: 20,
      });
    });

    it('debe usar paginacion personalizada', async () => {
      mockRepo.listByBusiness.mockResolvedValue({ data: [], total: 0 });

      await useCase.execute({
        businessId: 'biz-1',
        page: 2,
        pageSize: 10,
      });

      expect(mockRepo.listByBusiness).toHaveBeenCalledWith('biz-1', {
        search: undefined,
        isCustomer: undefined,
        isSupplier: undefined,
        isEmployee: undefined,
        page: 2,
        pageSize: 10,
      });
    });

    it('debe filtrar por busqueda y tipo', async () => {
      mockRepo.listByBusiness.mockResolvedValue({ data: [], total: 0 });

      await useCase.execute({
        businessId: 'biz-1',
        search: 'Juan',
        isCustomer: true,
      });

      expect(mockRepo.listByBusiness).toHaveBeenCalledWith('biz-1', {
        search: 'Juan',
        isCustomer: true,
        isSupplier: undefined,
        isEmployee: undefined,
        page: 1,
        pageSize: 20,
      });
    });
  });
});