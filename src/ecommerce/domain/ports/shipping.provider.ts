import { ShipmentStatus } from "../entities/shipment.entity.js";

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  countryCode: string;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  price: number;
  currency: string;
  estimatedDays: number;
}

export interface ShippingLabel {
  labelId: string;
  trackingNumber: string;
  labelUrl: string;
}

export interface ShippingProvider {
  getRates(params: {
    destinationAddress: Address;
    packageWeight: number;
    packageDimensions?: { length: number; width: number; height: number };
  }): Promise<ShippingRate[]>;

  createLabel(params: {
    orderId: string;
    shippingRate: ShippingRate;
    fromAddress: Address;
    toAddress: Address;
  }): Promise<ShippingLabel>;

  getTrackingInfo(trackingNumber: string): Promise<{
    status: ShipmentStatus;
    events: Array<{ date: Date; location: string; description: string }>;
  }>;
}
