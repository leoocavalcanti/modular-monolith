import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { PaymentTransaction } from '../entity/payment-transaction.entity';
import { PaymentStatus } from '../../core/enum/payment-status.enum';
import { PaymentMethod } from '../../core/enum/payment-method.enum';

@Injectable()
export class PaymentTransactionRepository extends DefaultTypeOrmRepository<PaymentTransaction> {
  constructor(
    @InjectDataSource('payment')
    dataSource: DataSource
  ) {
    super(PaymentTransaction, dataSource.manager);
  }

  async findByOrderId(orderId: string): Promise<PaymentTransaction[]> {
    return this.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTransactionId(transactionId: string): Promise<PaymentTransaction | null> {
    return this.findOne({
      where: { transactionId },
    });
  }

  async findByStatus(status: PaymentStatus): Promise<PaymentTransaction[]> {
    return this.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findByPaymentMethod(paymentMethod: PaymentMethod): Promise<PaymentTransaction[]> {
    return this.find({
      where: { paymentMethod },
      order: { createdAt: 'DESC' },
    });
  }

  async findPendingPayments(): Promise<PaymentTransaction[]> {
    return this.find({
      where: [
        { status: PaymentStatus.PENDING },
        { status: PaymentStatus.PROCESSING }
      ],
      order: { createdAt: 'DESC' },
    });
  }
}