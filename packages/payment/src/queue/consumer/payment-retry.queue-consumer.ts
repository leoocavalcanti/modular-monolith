import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { AppLogger } from '@tlc/shared-module/logger';
import { QUEUES } from '@tlc/shared-module/queue';
import { Job } from 'bullmq';
import { PaymentSimulatorService } from '../../core/service/payment-simulator.service';
import { PaymentTransactionRepository } from '../../persistence/repository/payment-transaction.repository';
import { PaymentProcessingJobData } from '../producer/payment-processing.queue-producer';
import { PaymentNotFoundException } from '../../core/exception/payment-not-found.exception';

@Processor(QUEUES.PAYMENT_RETRY)
export class PaymentRetryConsumer extends WorkerHost {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAYS = [5000, 15000, 60000]; // 5s, 15s, 1min

  constructor(
    private readonly paymentRepository: PaymentTransactionRepository,
    private readonly paymentSimulator: PaymentSimulatorService,
    private readonly logger: AppLogger
  ) {
    super();
  }

  async process(job: Job<PaymentProcessingJobData, void>) {
    const { transactionId, amount, paymentMethod, cardDetails, retryAttempt = 0 } = job.data;
    this.logger.log(`Retrying payment for transaction ${transactionId}, attempt: ${retryAttempt + 1}`);

    const transaction = await this.paymentRepository.findOneById(transactionId);
    if (!transaction) {
      throw new PaymentNotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    try {
      const result = await this.paymentSimulator.simulatePayment(
        amount,
        paymentMethod as any,
        cardDetails
      );

      if (result.success) {
        await this.paymentRepository.updateStatus(transactionId, 'completed');
        this.logger.log(`Payment retry successful for transaction ${transactionId} on attempt ${retryAttempt + 1}`);
      } else {
        if (retryAttempt < this.MAX_RETRY_ATTEMPTS - 1) {
          const nextDelay = this.RETRY_DELAYS[retryAttempt + 1] || 60000;
          await job.updateData({
            ...job.data,
            retryAttempt: retryAttempt + 1,
          });
          
          this.logger.warn(`Payment retry ${retryAttempt + 1} failed for transaction ${transactionId}. Scheduling next retry in ${nextDelay}ms`);
          throw new Error(`Payment retry failed: ${result.errorCode}. Will retry again.`);
        } else {
          await this.paymentRepository.updateStatus(transactionId, 'failed');
          this.logger.error(`Payment failed permanently for transaction ${transactionId} after ${this.MAX_RETRY_ATTEMPTS} attempts`);
          throw new Error(`Payment failed permanently: ${result.errorCode}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in payment retry for transaction ${transactionId}`, {
        error,
        transactionId,
        retryAttempt,
      });
      
      if (retryAttempt >= this.MAX_RETRY_ATTEMPTS - 1) {
        await this.paymentRepository.updateStatus(transactionId, 'failed');
      }
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<PaymentProcessingJobData>, error: Error) {
    this.logger.error(`Payment retry job failed: ${job.id}`, {
      job: job.data,
      error,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<PaymentProcessingJobData>) {
    this.logger.log(`Payment retry job completed: ${job.id}`, {
      transactionId: job.data.transactionId,
      retryAttempt: job.data.retryAttempt,
    });
  }
}