import { Shipment, ShipmentProps } from "../entities/shipment.entity.js";

export interface ShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByOrderId(orderId: string): Promise<Shipment[]>;
  create(shipment: Shipment): Promise<void>;
  update(shipment: Shipment): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ShipmentPropsDTO {
  orderId: string;
  orderLineIds?: string[];
  carrier?: string;
  trackingNumber?: string;
  shippingMethodId?: string;
  estimatedDelivery?: Date;
}

export function buildShipment(props: ShipmentPropsDTO, id: string): Shipment {
  return new Shipment({
    id,
    orderId: props.orderId,
    orderLineIds: props.orderLineIds ?? [],
    carrier: props.carrier ?? null,
    trackingNumber: props.trackingNumber ?? null,
    status: "PENDING",
    shippingMethodId: props.shippingMethodId ?? null,
    estimatedDelivery: props.estimatedDelivery ?? null,
    actualDelivery: null,
    createdAt: new Date(),
    updatedAt: null,
  });
}
