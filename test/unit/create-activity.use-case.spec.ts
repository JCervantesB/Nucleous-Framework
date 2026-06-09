import { CreateActivityUseCase } from '../../src/core/domain/activity/use-cases/create-activity.use-case';
import { Activity } from '../../src/core/domain/activity/activity.entity';
import type { ActivityRepository } from '../../src/core/domain/activity/activity.repository';

describe('CreateActivityUseCase (Unit)', () => {
  let useCase: CreateActivityUseCase;
  let mockRepo: jest.Mocked<ActivityRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      listForUser: jest.fn(),
      listForRecord: jest.fn(),
    } as any;
    useCase = new CreateActivityUseCase(mockRepo);
  });

  describe('execute', () => {
    it('debe crear una actividad', async () => {
      const mockActivity = Activity.create({
        businessId: 'biz-1',
        userId: 'user-assigned',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CALL',
        title: 'Llamar a cliente',
        note: 'Revisar historial',
        createdBy: 'user-creator',
      }) as any;
      mockRepo.create.mockResolvedValue(mockActivity);

      const result = await useCase.execute({
        businessId: 'biz-1',
        creatorUserId: 'user-creator',
        assignedUserId: 'user-assigned',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CALL',
        title: 'Llamar a cliente',
        note: 'Revisar historial',
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Llamar a cliente');
      expect(result.status).toBe('PENDING');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('debe crear actividad con fecha de vencimiento', async () => {
      const dueDate = new Date('2026-06-15');
      const mockActivity = Activity.create({
        businessId: 'biz-1',
        userId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'MEETING',
        title: 'Reunion',
        dueDate,
      }) as any;
      mockRepo.create.mockResolvedValue(mockActivity);

      const result = await useCase.execute({
        businessId: 'biz-1',
        creatorUserId: 'user-creator',
        assignedUserId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'MEETING',
        title: 'Reunion',
        dueDate,
      });

      expect(result.dueDate).toEqual(dueDate);
    });

    it('debe crear actividad pinned', async () => {
      const mockActivity = Activity.create({
        businessId: 'biz-1',
        userId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'NOTE',
        title: 'Nota importante',
        isPinned: true,
      }) as any;
      mockRepo.create.mockResolvedValue(mockActivity);

      const result = await useCase.execute({
        businessId: 'biz-1',
        creatorUserId: 'user-creator',
        assignedUserId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'NOTE',
        title: 'Nota importante',
        isPinned: true,
      });

      expect(result.isPinned).toBe(true);
    });
  });
});