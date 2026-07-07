export interface InventoryOrderFulfillmentService {
  createOutboundMove(params: {
    businessId: string;
    productId: string;
    variantId?: string;
    locationId: string;
    quantity: number;
    reference: string;
  }): Promise<void>;

  validateStock(params: {
    productId: string;
    variantId?: string;
    locationId: string;
    quantity: number;
  }): Promise<{ available: boolean; currentStock: number }>;
}
