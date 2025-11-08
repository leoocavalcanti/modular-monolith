import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { QUEUES } from '@tlc/shared-module/queue';
import { Queue } from 'bullmq';
import { PaymentTransaction } from '../../persistence/entity/payment-transaction.entity';

export interface PaymentProcessingJobData {
  transactionId: string;
  amount: number;
  paymentMethod: string;
  cardDetails?: any;
  retryAttempt?: number;
}

@Injectable()
export class PaymentProcessingProducer {
  constructor(
    @InjectQueue(QUEUES.PAYMENT_PROCESSING) private paymentQueue: Queue,
    @InjectQueue(QUEUES.PAYMENT_RETRY) private retryQueue: Queue,
    private readonly logger: AppLogger
  ) {}

  private createPaymentJob(transaction: PaymentTransaction, retryAttempt = 0): PaymentProcessingJobData {
    return {
      transactionId: transaction.id,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      cardDetails: transaction.cardDetails,
      retryAttempt,
    };
  }

  async processPayment(transaction: PaymentTransaction) {
    this.logger.log(
      `Queueing payment processing job for transaction ID: ${transaction.id}`
    );

    const job = await this.paymentQueue.add(
      'process',
      this.createPaymentJob(transaction),
      {
        priority: 10,
        delay: 0,
      }
    );

    this.logger.log(
      `Payment processing job created with ID: ${job.id} for transaction ID: ${transaction.id}`
    );
    return job.id;
  }

  async retryPayment(transaction: PaymentTransaction, retryAttempt: number, delayMs = 5000) {
    this.logger.log(
      `Queueing payment retry job for transaction ID: ${transaction.id}, attempt: ${retryAttempt}`
    );

    const job = await this.retryQueue.add(
      'retry',
      this.createPaymentJob(transaction, retryAttempt),
      {
        priority: 5,
        delay: delayMs,
      }
    );

    this.logger.log(
      `Payment retry job created with ID: ${job.id} for transaction ID: ${transaction.id}`
    );
    return job.id;
  }

  async processPaymentConfirmation(transactionId: string) {
    this.logger.log(
      `Queueing payment confirmation job for transaction ID: ${transactionId}`
    );

    const job = await this.paymentQueue.add(
      'confirm',
      { transactionId },
      {
        priority: 15,
      }
    );

    this.logger.log(
      `Payment confirmation job created with ID: ${job.id} for transaction ID: ${transactionId}`
    );
    return job.id;
  }
}