import { Entity, Column } from 'typeorm';
import { DefaultEntity } from '@tlc/shared-module/typeorm';
import { PaymentStatus } from '../../core/enum/payment-status.enum';
import { PaymentMethod } from '../../core/enum/payment-method.enum';

@Entity({ name: 'PaymentTransaction' })
export class PaymentTransaction extends DefaultEntity<PaymentTransaction> {

  @Column()
  orderId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  gatewayReference: string;

  @Column()
  customerEmail: string;

  @Column('json', { nullable: true })
  cardDetails: {
    lastFourDigits?: string;
    cardBrand?: string;
    cardholderName?: string;
  };

  @Column('json', { nullable: true })
  pixDetails: {
    pixKey?: string;
    qrCode?: string;
    expiresAt?: Date;
  };

  @Column('json', { nullable: true })
  boletoDetails: {
    barcode?: string;
    digitalLine?: string;
    expiresAt?: Date;
  };

  @Column({ nullable: true })
  errorCode: string;

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('json', { nullable: true })
  metadata: Record<string, unknown>;


  @Column({ nullable: true })
  processedAt: Date;

  isSuccess(): boolean {
    return this.status === PaymentStatus.SUCCESS;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  isPending(): boolean {
    return this.status === PaymentStatus.PENDING || this.status === PaymentStatus.PROCESSING;
  }

  static create(data: {
    orderId: string;
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    status?: PaymentStatus;
    transactionId?: string;
    gatewayReference?: string;
    customerEmail: string;
    cardDetails?: {
      lastFourDigits?: string;
      cardBrand?: string;
      cardholderName?: string;
    };
    pixDetails?: {
      pixKey?: string;
      qrCode?: string;
      expiresAt?: Date;
    };
    boletoDetails?: {
      barcode?: string;
      digitalLine?: string;
      expiresAt?: Date;
    };
    errorCode?: string;
    errorMessage?: string;
    metadata?: Record<string, unknown>;
    processedAt?: Date;
  }): PaymentTransaction {
    const transaction = new PaymentTransaction({
      ...data,
      currency: data.currency || 'BRL',
      status: data.status || PaymentStatus.PENDING,
      cardDetails: data.cardDetails || {},
      pixDetails: data.pixDetails || {},
      boletoDetails: data.boletoDetails || {},
      metadata: data.metadata || {},
    } as Partial<PaymentTransaction>);
    return transaction;
  }
}