import { CompleteActivityUseCase } from '../../src/core/domain/activity/use-cases/complete-activity.use-case';
import { Activity } from '../../src/core/domain/activity/activity.entity';
import type { ActivityRepository } from '../../src/core/domain/activity/activity.repository';

describe('CompleteActivityUseCase (Unit)', () => {
  let useCase: CompleteActivityUseCase;
  let mockRepo: jest.Mocked<ActivityRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      listForUser: jest.fn(),
      listForRecord: jest.fn(),
    } as any;
    useCase = new CompleteActivityUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe completar una actividad pendiente', async () => {
      const mockActivity = Activity.create({
        businessId: 'biz-1',
        userId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CALL',
        title: 'Llamar',
      }) as any;
      mockRepo.findById.mockResolvedValue(mockActivity);
      mockRepo.save.mockResolvedValue(mockActivity);

      await useCase.execute({
        businessId: 'biz-1',
        activityId: 'activity-123',
        userId: 'user-1',
      });

      expect(mockRepo.findById).toHaveBeenCalledWith('activity-123', 'biz-1');
      expect(mockRepo.save).toHaveBeenCalledWith(mockActivity);
    });

    it('debe lanzar error si la actividad no existe', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute({
        businessId: 'biz-1',
        activityId: 'non-existent',
        userId: 'user-1',
      })).rejects.toThrow('Actividad no encontrada');
    });

    it('debe llamar a markDone en la actividad', async () => {
      const mockActivity = Activity.create({
        businessId: 'biz-1',
        userId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CALL',
        title: 'Llamar',
      }) as any;
      mockRepo.findById.mockResolvedValue(mockActivity);
      mockRepo.save.mockResolvedValue(mockActivity);

      await useCase.execute({
        businessId: 'biz-1',
        activityId: 'activity-123',
        userId: 'user-1',
      });

      expect(mockActivity.props.status).toBe('DONE');
    });
  });
});