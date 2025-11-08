import { Injectable } from '@nestjs/common';
import { PaymentProcessingService, ProcessPaymentData, PaymentResult } from '../../core/service/payment-processing.service';
import { PaymentTransaction } from '../../persistence/entity/payment-transaction.entity';

export interface PaymentProcessingApi {
  processPayment(data: ProcessPaymentData): Promise<PaymentResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentResult>;
  getPaymentsByOrderId(orderId: string): Promise<PaymentTransaction[]>;
}

@Injectable()
export class PaymentFacade implements PaymentProcessingApi {
  constructor(private readonly paymentProcessingService: PaymentProcessingService) {}

  async processPayment(data: ProcessPaymentData): Promise<PaymentResult> {
    return this.paymentProcessingService.processPayment(data);
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    return this.paymentProcessingService.getPaymentStatus(paymentId);
  }

  async getPaymentsByOrderId(orderId: string): Promise<PaymentTransaction[]> {
    return this.paymentProcessingService.getPaymentsByOrderId(orderId);
  }
}