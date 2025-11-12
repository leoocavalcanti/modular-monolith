import { PaymentTransaction } from '../../persistence/entity/payment-transaction.entity';

export interface ProcessPaymentData {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodId: string;
  userId: string;
}

export interface IPaymentProcessingService {
  processPayment(data: ProcessPaymentData): Promise<PaymentTransaction>;
  getPaymentById(paymentId: string): Promise<PaymentTransaction>;
  getPaymentsByOrderId(orderId: string): Promise<PaymentTransaction[]>;
  refundPayment(paymentId: string, amount?: number): Promise<PaymentTransaction>;
  confirmPayment(paymentId: string): Promise<PaymentTransaction>;
  cancelPayment(paymentId: string): Promise<PaymentTransaction>;
}