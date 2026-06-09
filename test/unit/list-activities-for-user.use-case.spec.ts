import { ListActivitiesForUserUseCase } from '../../src/core/domain/activity/use-cases/list-activities-for-user.use-case';
import { Activity } from '../../src/core/domain/activity/activity.entity';
import type { ActivityRepository } from '../../src/core/domain/activity/activity.repository';

describe('ListActivitiesForUserUseCase (Unit)', () => {
  let useCase: ListActivitiesForUserUseCase;
  let mockRepo: jest.Mocked<ActivityRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      listForUser: jest.fn(),
      listForRecord: jest.fn(),
    } as any;
    useCase = new ListActivitiesForUserUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe listar actividades para un usuario', async () => {
      const mockActivities = [
        Activity.create({
          businessId: 'biz-1',
          userId: 'user-1',
          relatedTable: 'contacts',
          relatedId: 'contact-1',
          type: 'CALL',
          title: 'Llamar a cliente',
        }) as any,
      ];
      mockRepo.listForUser.mockResolvedValue(mockActivities);

      const result = await useCase.execute({
        businessId: 'biz-1',
        userId: 'user-1',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Llamar a cliente');
    });

    it('debe filtrar por status', async () => {
      mockRepo.listForUser.mockResolvedValue([]);

      await useCase.execute({
        businessId: 'biz-1',
        userId: 'user-1',
        status: 'PENDING',
      });

      expect(mockRepo.listForUser).toHaveBeenCalledWith({
        businessId: 'biz-1',
        userId: 'user-1',
        status: 'PENDING',
      });
    });

    it('debe retornar array vacio si no hay actividades', async () => {
      mockRepo.listForUser.mockResolvedValue([]);

      const result = await useCase.execute({
        businessId: 'biz-1',
        userId: 'user-1',
      });

      expect(result.data).toEqual([]);
    });
  });
});