import { RecordEventController } from '../../src/core/infrastructure/http/record-event.controller';
import { AddRecordEventUseCase } from '../../src/core/domain/record-event/use-cases/add-record-event.use-case';
import { ListRecordEventsUseCase } from '../../src/core/domain/record-event/use-cases/list-record-events.use-case';
import { CurrentBusinessService } from '../../src/core/application/current-business.service';
import { RecordEvent } from '../../src/core/domain/record-event/record-event.entity';

describe('RecordEventController (Unit)', () => {
  let controller: RecordEventController;
  let mockAddRecordEventUseCase: jest.Mocked<AddRecordEventUseCase>;
  let mockListRecordEventsUseCase: jest.Mocked<ListRecordEventsUseCase>;
  let mockCurrentBusiness: jest.Mocked<CurrentBusinessService>;

  beforeEach(() => {
    mockAddRecordEventUseCase = { execute: jest.fn() } as any;
    mockListRecordEventsUseCase = { execute: jest.fn() } as any;
    mockCurrentBusiness = { getBusinessId: jest.fn().mockReturnValue('biz-123') } as any;

    controller = new RecordEventController(
      mockAddRecordEventUseCase,
      mockListRecordEventsUseCase,
      mockCurrentBusiness,
    );
  });

  describe('addEvent', () => {
    it('debe agregar un evento de registro', async () => {
      const mockEvent = RecordEvent.create({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CREATED',
        message: 'Contacto creado',
        userId: 'user-123',
      }) as any;
      mockAddRecordEventUseCase.execute.mockResolvedValue(mockEvent);

      const result = await controller.addEvent(
        'contacts',
        'contact-123',
        { type: 'CREATED', message: 'Contacto creado' },
        { user: { id: 'user-123' } } as any,
      );

      expect(result.id).toBeDefined();
      expect(result.type).toBe('CREATED');
      expect(result.message).toBe('Contacto creado');
    });

    it('debe usar userId del request', async () => {
      const mockEvent = RecordEvent.create({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CREATED',
        message: 'Test',
      }) as any;
      mockAddRecordEventUseCase.execute.mockResolvedValue(mockEvent);

      await controller.addEvent(
        'contacts',
        'contact-123',
        { type: 'CREATED', message: 'Test' },
        { user: { id: 'custom-user' } } as any,
      );

      expect(mockAddRecordEventUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'custom-user' }),
      );
    });

    it('debe usar null si no hay user en request', async () => {
      const mockEvent = RecordEvent.create({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'CREATED',
        message: 'Test',
      }) as any;
      mockAddRecordEventUseCase.execute.mockResolvedValue(mockEvent);

      await controller.addEvent(
        'contacts',
        'contact-123',
        { type: 'CREATED', message: 'Test' },
        { user: undefined } as any,
      );

      expect(mockAddRecordEventUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({ userId: null }),
      );
    });

    it('debe pasar table e id como relatedTable y relatedId', async () => {
      const mockEvent = RecordEvent.create({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
        type: 'UPDATED',
        message: 'Actualizado',
      }) as any;
      mockAddRecordEventUseCase.execute.mockResolvedValue(mockEvent);

      await controller.addEvent(
        'contacts',
        'contact-123',
        { type: 'UPDATED', message: 'Actualizado' },
        { user: { id: 'user-1' } } as any,
      );

      expect(mockAddRecordEventUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          relatedTable: 'contacts',
          relatedId: 'contact-123',
        }),
      );
    });
  });

  describe('listEvents', () => {
    it('debe listar eventos para un registro', async () => {
      const mockEvents = [
        RecordEvent.create({
          businessId: 'biz-123',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'CREATED',
          message: 'Creado',
        }) as any,
        RecordEvent.create({
          businessId: 'biz-123',
          relatedTable: 'contacts',
          relatedId: 'contact-123',
          type: 'UPDATED',
          message: 'Actualizado',
        }) as any,
      ];
      mockListRecordEventsUseCase.execute.mockResolvedValue({ data: mockEvents });

      const result = await controller.listEvents('contacts', 'contact-123');

      expect(result.data).toHaveLength(2);
    });

    it('debe pasar businessId y params correctos', async () => {
      mockListRecordEventsUseCase.execute.mockResolvedValue({ data: [] });

      await controller.listEvents('contacts', 'contact-123');

      expect(mockListRecordEventsUseCase.execute).toHaveBeenCalledWith({
        businessId: 'biz-123',
        relatedTable: 'contacts',
        relatedId: 'contact-123',
      });
    });
  });
});