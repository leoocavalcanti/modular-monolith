import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { PaymentTransactionRepository } from '../../persistence/repository/payment-transaction.repository';
import { PaymentProcessingProducer } from '../../queue/producer/payment-processing.queue-producer';
import { PaymentStatus } from '../enum/payment-status.enum';

@Injectable()
export class RetryFailedPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentTransactionRepository,
    private readonly paymentQueue: PaymentProcessingProducer,
    private readonly logger: AppLogger
  ) {}

  async execute(transactionId: string, retryAttempt: number = 1): Promise<{ queueJobId: string; retryAttempt: number }> {
    this.logger.log(`Retrying failed payment for transaction ${transactionId}`, {
      transactionId,
      retryAttempt,
    });

    return await runInTransaction(
      async () => {
        const transaction = await this.paymentRepository.findOneById(transactionId);
        
        if (!transaction) {
          throw new Error(`Transaction ${transactionId} not found`);
        }

        if (transaction.status !== 'failed') {
          throw new Error(`Cannot retry transaction ${transactionId} - status is ${transaction.status}`);
        }

        // Reset status to processing for retry
        transaction.status = PaymentStatus.PROCESSING;
        await this.paymentRepository.save(transaction);

        // Queue retry with delay based on attempt number
        const delayMs = Math.min(5000 * Math.pow(2, retryAttempt - 1), 60000); // Max 1 minute delay
        const queueJobId = await this.paymentQueue.retryPayment(transaction, retryAttempt, delayMs);

        this.logger.log(`Payment retry queued`, {
          transactionId,
          retryAttempt,
          queueJobId,
          delayMs,
        });

        return {
          queueJobId: queueJobId || '',
          retryAttempt,
        };
      },
      {
        connectionName: 'payment',
      }
    );
  }
}