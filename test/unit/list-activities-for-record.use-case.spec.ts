import { ListActivitiesForRecordUseCase } from '../../src/core/domain/activity/use-cases/list-activities-for-record.use-case';
import { Activity } from '../../src/core/domain/activity/activity.entity';
import type { ActivityRepository } from '../../src/core/domain/activity/activity.repository';

describe('ListActivitiesForRecordUseCase (Unit)', () => {
  let useCase: ListActivitiesForRecordUseCase;
  let mockRepo: jest.Mocked<ActivityRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      listForUser: jest.fn(),
      listForRecord: jest.fn(),
    } as any;
    useCase = new ListActivitiesForRecordUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe listar actividades para un registro', async () => {
      const mockActivities = [
        Activity.create({
          businessId: 'biz-1',
          userId: 'user-1',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'MEETING',
          title: 'Reunion con cliente',
        }) as any,
      ];
      mockRepo.listForRecord.mockResolvedValue(mockActivities);

      const result = await useCase.execute({
        businessId: 'biz-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Reunion con cliente');
    });

    it('debe filtrar por status DONE', async () => {
      mockRepo.listForRecord.mockResolvedValue([]);

      await useCase.execute({
        businessId: 'biz-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        status: 'DONE',
      });

      expect(mockRepo.listForRecord).toHaveBeenCalledWith({
        businessId: 'biz-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        status: 'DONE',
      });
    });
  });
});