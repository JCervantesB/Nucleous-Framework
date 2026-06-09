import { CreateContactUseCase } from '../../src/core/domain/contacts/use-cases/create-contact.use-case';
import { Contact } from '../../src/core/domain/contacts/contact.entity';
import type { ContactRepository } from '../../src/core/domain/contacts/contact.repository';

describe('CreateContactUseCase (Unit)', () => {
  let useCase: CreateContactUseCase;
  let mockRepo: jest.Mocked<ContactRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listByBusiness: jest.fn(),
    } as any;
    useCase = new CreateContactUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe crear un contacto tipo PERSONA', async () => {
      const mockContact = Contact.create({
        businessId: 'biz-1',
        type: 'PERSON',
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '+5215512345678',
        isCustomer: true,
      }) as any;
      mockRepo.create.mockResolvedValue(mockContact);

      const result = await useCase.execute({
        businessId: 'biz-1',
        userId: 'user-123',
        type: 'PERSON',
        name: 'Juan Perez',
        email: 'juan@example.com',
        phone: '+5215512345678',
        isCustomer: true,
      });

      expect(result.contact).toBeDefined();
      expect(result.contact.name).toBe('Juan Perez');
      expect(result.contact.type).toBe('PERSON');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('debe crear un contacto tipo EMPRESA', async () => {
      const mockContact = Contact.create({
        businessId: 'biz-1',
        type: 'COMPANY',
        name: 'Acme Corp',
        taxId: 'RFC-123456',
        isSupplier: true,
      }) as any;
      mockRepo.create.mockResolvedValue(mockContact);

      const result = await useCase.execute({
        businessId: 'biz-1',
        userId: 'user-123',
        type: 'COMPANY',
        name: 'Acme Corp',
        taxId: 'RFC-123456',
        isSupplier: true,
      });

      expect(result.contact.name).toBe('Acme Corp');
      expect(result.contact.type).toBe('COMPANY');
    });

    it('debe crear contacto con valores por defecto', async () => {
      const mockContact = Contact.create({
        businessId: 'biz-1',
        type: 'PERSON',
        name: 'Test',
      }) as any;
      mockRepo.create.mockResolvedValue(mockContact);

      const result = await useCase.execute({
        businessId: 'biz-1',
        userId: 'user-123',
        type: 'PERSON',
        name: 'Test',
      });

      expect(result.contact.isCustomer).toBe(false);
      expect(result.contact.isSupplier).toBe(false);
      expect(result.contact.isEmployee).toBe(false);
    });
  });
});