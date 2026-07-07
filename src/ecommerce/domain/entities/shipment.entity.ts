export type ShipmentStatus =
  | "PENDING"
  | "LABELED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "EXCEPTION";

export interface ShipmentProps {
  id: string;
  orderId: string;
  orderLineIds: string[];
  carrier: string | null;
  trackingNumber: string | null;
  status: ShipmentStatus;
  shippingMethodId: string | null;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export class Shipment {
  readonly id: string;
  readonly orderId: string;
  orderLineIds: string[];
  carrier: string | null;
  trackingNumber: string | null;
  status: ShipmentStatus;
  shippingMethodId: string | null;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
  readonly createdAt: Date;
  updatedAt: Date | null;

  constructor(props: ShipmentProps) {
    this.id = props.id;
    this.orderId = props.orderId;
    this.orderLineIds = props.orderLineIds;
    this.carrier = props.carrier;
    this.trackingNumber = props.trackingNumber;
    this.status = props.status;
    this.shippingMethodId = props.shippingMethodId;
    this.estimatedDelivery = props.estimatedDelivery;
    this.actualDelivery = props.actualDelivery;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  markAsLabeled(carrier: string, trackingNumber: string): void {
    if (this.status !== "PENDING") {
      throw new Error("Solo se pueden etiquetar envíos pendientes");
    }
    this.carrier = carrier;
    this.trackingNumber = trackingNumber;
    this.status = "LABELED";
    this.updatedAt = new Date();
  }

  markDelivered(): void {
    this.status = "DELIVERED";
    this.actualDelivery = new Date();
    this.updatedAt = new Date();
  }

  toProps(): ShipmentProps {
    return {
      id: this.id,
      orderId: this.orderId,
      orderLineIds: this.orderLineIds,
      carrier: this.carrier,
      trackingNumber: this.trackingNumber,
      status: this.status,
      shippingMethodId: this.shippingMethodId,
      estimatedDelivery: this.estimatedDelivery,
      actualDelivery: this.actualDelivery,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
