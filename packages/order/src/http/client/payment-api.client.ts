import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '@tlc/shared-module/http-client';

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

@Injectable()
export class PaymentApiClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult> {
    const paymentApiUrl = this.configService.get('order.paymentApi.url');
    
    const response = await this.httpClient.post<PaymentResult>(
      `${paymentApiUrl}/payments/process`,
      paymentRequest
    );

    return response;
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    const paymentApiUrl = this.configService.get('order.paymentApi.url');
    
    const response = await this.httpClient.get<PaymentResult>(
      `${paymentApiUrl}/payments/${paymentId}`
    );

    return response;
  }
}