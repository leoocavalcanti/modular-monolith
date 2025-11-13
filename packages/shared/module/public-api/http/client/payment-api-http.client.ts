import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClient } from '../../../http-client/client/http.client';
import { PaymentApiInterface, PaymentRequest, PaymentResult } from '../../interface/payment-api.interface';

@Injectable()
export class PaymentApiHttpClient implements PaymentApiInterface {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}

  async processPayment(data: PaymentRequest): Promise<PaymentResult> {
    const paymentApiUrl = this.configService.get('order.paymentApi.url') || 'http://payment-api:3002';
    
    return this.httpClient.post<PaymentResult>(
      `${paymentApiUrl}/payments/process`,
      data
    );
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    const paymentApiUrl = this.configService.get('order.paymentApi.url') || 'http://payment-api:3002';
    
    return this.httpClient.get<PaymentResult>(
      `${paymentApiUrl}/payments/${paymentId}`
    );
  }
}