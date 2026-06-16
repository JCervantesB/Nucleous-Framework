import { InventoryMove, MoveType, MoveState } from './inventory-move.entity';

describe('InventoryMove', () => {
  const businessId = 'business-123';
  const productId = 'product-123';
  const unitOfMeasureId = 'uom-123';

  describe('create', () => {
    it('debe crear un movimiento en estado DRAFT', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      expect(move.id).toBeDefined();
      expect(move.businessId).toBe(businessId);
      expect(move.productId).toBe(productId);
      expect(move.state).toBe('DRAFT');
      expect(move.moveType).toBe('INBOUND');
      expect(move.quantity).toBe('10');
      expect(move.confirmedAt).toBeNull();
      expect(move.doneAt).toBeNull();
      expect(move.cancelledAt).toBeNull();
    });

    it('debe crear un movimiento TRANSFER con from y to location', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'TRANSFER',
        quantity: '5',
        unitOfMeasureId,
        fromLocationId: 'loc-001',
        toLocationId: 'loc-002',
        reference: 'PO-001',
        notes: 'Transferencia entre almacenes',
      });

      expect(move.fromLocationId).toBe('loc-001');
      expect(move.toLocationId).toBe('loc-002');
      expect(move.reference).toBe('PO-001');
      expect(move.notes).toBe('Transferencia entre almacenes');
    });
  });

  describe('fromProps', () => {
    it('debe crear un movimiento desde props', () => {
      const props = {
        id: 'move-id',
        businessId,
        productId,
        variantId: null,
        moveType: 'OUTBOUND' as MoveType,
        state: 'DONE' as MoveState,
        fromLocationId: 'loc-001',
        toLocationId: null,
        quantity: '20',
        unitOfMeasureId,
        reference: null,
        notes: null,
        externalId: null,
        originTable: null,
        originId: null,
        confirmedAt: new Date(),
        doneAt: new Date(),
        cancelledAt: null,
        createdAt: new Date(),
        updatedAt: null,
        createdBy: null,
        updatedBy: null,
      };

      const move = InventoryMove.fromProps(props);

      expect(move.id).toBe(props.id);
      expect(move.state).toBe('DONE');
    });
  });

  describe('confirm', () => {
    it('debe confirmar un movimiento DRAFT', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const confirmed = move.confirm();

      expect(confirmed.state).toBe('CONFIRMED');
      expect(confirmed.confirmedAt).toBeDefined();
    });

    it('debe lanzar error al confirmar un movimiento CONFIRMED', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const confirmed = move.confirm();

      expect(() => confirmed.confirm()).toThrow(
        'Solo se pueden confirmar movimientos en estado DRAFT',
      );
    });
  });

  describe('done', () => {
    it('debe completar un movimiento CONFIRMED', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const confirmed = move.confirm();
      const completed = confirmed.done();

      expect(completed.state).toBe('DONE');
      expect(completed.doneAt).toBeDefined();
    });

    it('debe lanzar error al completar un movimiento DRAFT', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      expect(() => move.done()).toThrow(
        'Solo se pueden completar movimientos en estado CONFIRMED',
      );
    });
  });

  describe('cancel', () => {
    it('debe cancelar un movimiento DRAFT', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const cancelled = move.cancel();

      expect(cancelled.state).toBe('CANCELLED');
      expect(cancelled.cancelledAt).toBeDefined();
    });

    it('debe cancelar un movimiento CONFIRMED', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const confirmed = move.confirm();
      const cancelled = confirmed.cancel();

      expect(cancelled.state).toBe('CANCELLED');
    });

    it('debe lanzar error al cancelar un movimiento DONE', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const confirmed = move.confirm();
      const completed = confirmed.done();

      expect(() => completed.cancel()).toThrow(
        'No se pueden cancelar movimientos ya completados',
      );
    });
  });

  describe('update', () => {
    it('debe actualizar campos de un movimiento DRAFT', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const updated = move.update({
        quantity: '20',
        notes: 'Cantidad actualizada',
      });

      expect(updated.quantity).toBe('20');
      expect(updated.notes).toBe('Cantidad actualizada');
    });

    it('debe lanzar error al actualizar un movimiento CONFIRMED', () => {
      const move = InventoryMove.create({
        businessId,
        productId,
        moveType: 'INBOUND',
        quantity: '10',
        unitOfMeasureId,
      });

      const confirmed = move.confirm();

      expect(() => confirmed.update({ quantity: '20' })).toThrow(
        'Solo se pueden editar movimientos en estado DRAFT',
      );
    });
  });
});
