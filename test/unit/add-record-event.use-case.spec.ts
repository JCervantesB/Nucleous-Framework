import { AddRecordEventUseCase } from '../../src/core/domain/record-event/use-cases/add-record-event.use-case';
import { RecordEvent } from '../../src/core/domain/record-event/record-event.entity';
import type { RecordEventRepository } from '../../src/core/domain/record-event/record-event.repository';

describe('AddRecordEventUseCase (Unit)', () => {
  let useCase: AddRecordEventUseCase;
  let mockRepo: jest.Mocked<RecordEventRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listForRecord: jest.fn(),
    } as any;
    useCase = new AddRecordEventUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe crear un evento de registro', async () => {
      const mockEvent = {
        id: 'event-123',
        businessId: 'biz-123',
        userId: 'user-456',
        relatedTable: 'contacts',
        relatedId: 'contact-789',
        type: 'CREATED',
        message: 'Contacto creado',
        createdAt: new Date(),
      };
      mockRepo.create.mockResolvedValue(RecordEvent.fromProps(mockEvent) as any);

      const result = await useCase.execute({
        businessId: 'biz-123',
        userId: 'user-456',
        relatedTable: 'contacts',
        relatedId: 'contact-789',
        type: 'CREATED',
        message: 'Contacto creado',
      });

      expect(result).toBeDefined();
      expect(result.businessId).toBe('biz-123');
      expect(result.type).toBe('CREATED');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('debe crear evento sin userId', async () => {
      const mockEvent = {
        id: 'event-123',
        businessId: 'biz-123',
        userId: null,
        relatedTable: 'contacts',
        relatedId: 'contact-789',
        type: 'DELETED',
        message: 'Contacto eliminado',
        createdAt: new Date(),
      };
      mockRepo.create.mockResolvedValue(RecordEvent.fromProps(mockEvent) as any);

      const result = await useCase.execute({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-789',
        type: 'DELETED',
        message: 'Contacto eliminado',
      });

      expect(result.userId).toBeNull();
    });
  });
});