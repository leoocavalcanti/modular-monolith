import { Expose } from 'class-transformer';
import { PaymentStatus } from '../../../../core/enum/payment-status.enum';
import { PaymentMethod } from '../../../../core/enum/payment-method.enum';

export class PaymentResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderId: string;

  @Expose()
  amount: number;

  @Expose()
  currency: string;

  @Expose()
  paymentMethod: PaymentMethod;

  @Expose()
  status: PaymentStatus;

  @Expose()
  transactionId: string;

  @Expose()
  gatewayReference: string;

  @Expose()
  customerEmail: string;

  @Expose()
  cardDetails: {
    lastFourDigits?: string;
    cardBrand?: string;
    cardholderName?: string;
  };

  @Expose()
  pixDetails: {
    pixKey?: string;
    qrCode?: string;
    expiresAt?: Date;
  };

  @Expose()
  boletoDetails: {
    barcode?: string;
    digitalLine?: string;
    expiresAt?: Date;
  };

  @Expose()
  errorCode: string;

  @Expose()
  errorMessage: string;

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  processedAt: Date;
}

export class ProcessPaymentResponseDto {
  @Expose()
  paymentId: string;

  @Expose()
  status: 'success' | 'failed' | 'pending';

  @Expose()
  transactionId: string;

  @Expose()
  errorMessage: string;

  @Expose()
  metadata: Record<string, any>;
}