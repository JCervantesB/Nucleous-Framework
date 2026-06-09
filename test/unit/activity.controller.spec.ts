import { ActivityController } from '../../src/core/infrastructure/http/activity.controller';
import { CreateActivityUseCase } from '../../src/core/domain/activity/use-cases/create-activity.use-case';
import { CompleteActivityUseCase } from '../../src/core/domain/activity/use-cases/complete-activity.use-case';
import { ListActivitiesForRecordUseCase } from '../../src/core/domain/activity/use-cases/list-activities-for-record.use-case';
import { ListActivitiesForUserUseCase } from '../../src/core/domain/activity/use-cases/list-activities-for-user.use-case';
import { CurrentBusinessService } from '../../src/core/application/current-business.service';
import { Activity } from '../../src/core/domain/activity/activity.entity';

describe('ActivityController (Unit)', () => {
  let controller: ActivityController;
  let mockCreateActivityUseCase: jest.Mocked<CreateActivityUseCase>;
  let mockCompleteActivityUseCase: jest.Mocked<CompleteActivityUseCase>;
  let mockListActivitiesForRecordUseCase: jest.Mocked<ListActivitiesForRecordUseCase>;
  let mockListActivitiesForUserUseCase: jest.Mocked<ListActivitiesForUserUseCase>;
  let mockCurrentBusiness: jest.Mocked<CurrentBusinessService>;

  beforeEach(() => {
    mockCreateActivityUseCase = { execute: jest.fn() } as any;
    mockCompleteActivityUseCase = { execute: jest.fn() } as any;
    mockListActivitiesForRecordUseCase = { execute: jest.fn() } as any;
    mockListActivitiesForUserUseCase = { execute: jest.fn() } as any;
    mockCurrentBusiness = { getBusinessId: jest.fn().mockReturnValue('biz-123') } as any;

    controller = new ActivityController(
      mockCreateActivityUseCase,
      mockCompleteActivityUseCase,
      mockListActivitiesForRecordUseCase,
      mockListActivitiesForUserUseCase,
      mockCurrentBusiness,
    );
  });

  describe('create', () => {
    it('debe crear una actividad', async () => {
      const mockActivity = Activity.create({
        businessId: 'biz-123',
        userId: 'user-assigned',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CALL',
        title: 'Llamar a cliente',
      }) as any;
      mockCreateActivityUseCase.execute.mockResolvedValue(mockActivity);

      const result = await controller.create(
        {
          assignedUserId: 'user-assigned',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'CALL',
          title: 'Llamar a cliente',
        },
        { user: { id: 'user-creator' } } as any,
      );

      expect(result.id).toBeDefined();
      expect(result.title).toBe('Llamar a cliente');
    });

    it('debe parsear dueDate si es string', async () => {
      const mockActivity = Activity.create({
        businessId: 'biz-123',
        userId: 'user-1',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'MEETING',
        title: 'Reunion',
      }) as any;
      mockCreateActivityUseCase.execute.mockResolvedValue(mockActivity);

      await controller.create(
        {
          assignedUserId: 'user-1',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'MEETING',
          title: 'Reunion',
          dueDate: '2026-06-15',
        },
        { user: { id: 'user-creator' } } as any,
      );

      expect(mockCreateActivityUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: new Date('2026-06-15'),
        }),
      );
    });
  });

  describe('complete', () => {
    it('debe completar una actividad', async () => {
      mockCompleteActivityUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.complete(
        'activity-123',
        { user: { id: 'user-1' } } as any,
      );

      expect(result).toEqual({ success: true });
      expect(mockCompleteActivityUseCase.execute).toHaveBeenCalledWith({
        businessId: 'biz-123',
        activityId: 'activity-123',
        userId: 'user-1',
      });
    });
  });

  describe('listForRecord', () => {
    it('debe listar actividades para un registro', async () => {
      const mockActivities = [
        Activity.create({
          businessId: 'biz-123',
          userId: 'user-1',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'CALL',
          title: 'Llamar',
        }) as any,
      ];
      mockListActivitiesForRecordUseCase.execute.mockResolvedValue({
        data: mockActivities,
      });

      const result = await controller.listForRecord('contacts', 'contact-123', undefined);

      expect(result.data).toHaveLength(1);
    });

    it('debe pasar status al use case', async () => {
      mockListActivitiesForRecordUseCase.execute.mockResolvedValue({ data: [] });

      await controller.listForRecord('contacts', 'contact-123', 'PENDING');

      expect(mockListActivitiesForRecordUseCase.execute).toHaveBeenCalledWith({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        status: 'PENDING',
      });
    });
  });

  describe('listForCurrentUser', () => {
    it('debe listar actividades del usuario actual', async () => {
      const mockActivities = [
        Activity.create({
          businessId: 'biz-123',
          userId: 'user-1',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'CALL',
          title: 'Llamar',
        }) as any,
      ];
      mockListActivitiesForUserUseCase.execute.mockResolvedValue({
        data: mockActivities,
      });

      const result = await controller.listForCurrentUser(
        { user: { id: 'user-1' } } as any,
        undefined,
      );

      expect(result.data).toHaveLength(1);
    });

    it('debe usar userId del request', async () => {
      mockListActivitiesForUserUseCase.execute.mockResolvedValue({ data: [] });

      await controller.listForCurrentUser(
        { user: { id: 'custom-user' } } as any,
        'DONE',
      );

      expect(mockListActivitiesForUserUseCase.execute).toHaveBeenCalledWith({
        businessId: 'biz-123',
        userId: 'custom-user',
        status: 'DONE',
      });
    });
  });
});