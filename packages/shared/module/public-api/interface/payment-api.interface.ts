export interface PaymentApiInterface {
  processPayment(data: PaymentRequest): Promise<PaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentResult>;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  };
  customerEmail: string;
}

export interface PaymentResult {
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}