import { ListRecordEventsUseCase } from '../../src/core/domain/record-event/use-cases/list-record-events.use-case';
import type { RecordEventRepository } from '../../src/core/domain/record-event/record-event.repository';

describe('ListRecordEventsUseCase (Unit)', () => {
  let useCase: ListRecordEventsUseCase;
  let mockRepo: jest.Mocked<RecordEventRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      listForRecord: jest.fn(),
    } as any;
    useCase = new ListRecordEventsUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe listar eventos para un registro especifico', async () => {
      const mockEvents = [
        { id: '1', type: 'CREATED', message: 'Usuario creado' },
        { id: '2', type: 'UPDATED', message: 'Usuario actualizado' },
      ];
      mockRepo.listForRecord.mockResolvedValue(mockEvents as any);

      const result = await useCase.execute({
        businessId: 'biz-123',
        relatedTable: 'users',
        relatedId: 'user-456',
      });

      expect(result.data).toEqual(mockEvents);
      expect(mockRepo.listForRecord).toHaveBeenCalledWith({
        businessId: 'biz-123',
        relatedTable: 'users',
        relatedId: 'user-456',
      });
    });

    it('debe retornar array vacio si no hay eventos', async () => {
      mockRepo.listForRecord.mockResolvedValue([]);

      const result = await useCase.execute({
        businessId: 'biz-123',
        relatedTable: 'users',
        relatedId: 'user-456',
      });

      expect(result.data).toEqual([]);
    });
  });
});