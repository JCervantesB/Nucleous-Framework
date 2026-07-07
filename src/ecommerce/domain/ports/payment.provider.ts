export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  metadata: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  errorMessage?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  errorMessage?: string;
}

export interface PaymentProvider {
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent>;

  confirmPayment(paymentIntentId: string): Promise<PaymentResult>;

  refundPayment(params: {
    transactionId: string;
    amount?: number;
  }): Promise<RefundResult>;
}
