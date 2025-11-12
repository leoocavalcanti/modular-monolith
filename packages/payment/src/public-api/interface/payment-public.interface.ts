export interface PaymentResult {
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  errorMessage?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  orderId: string;
}

export interface IPaymentPublicApi {
  processPayment(orderId: string, amount: number, paymentMethodId: string): Promise<PaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  confirmPayment(paymentId: string): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResult>;
  cancelPayment(paymentId: string): Promise<PaymentResult>;
}