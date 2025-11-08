import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { AppLogger } from '@tlc/shared-module/logger';
import { QUEUES } from '@tlc/shared-module/queue';
import { Job } from 'bullmq';
import { PaymentSimulatorService } from '../../core/service/payment-simulator.service';
import { PaymentTransactionRepository } from '../../persistence/repository/payment-transaction.repository';
import { PaymentProcessingJobData } from '../producer/payment-processing.queue-producer';
import { PaymentNotFoundException } from '../../core/exception/payment-not-found.exception';

@Processor(QUEUES.PAYMENT_PROCESSING)
export class PaymentProcessingConsumer extends WorkerHost {
  constructor(
    private readonly paymentRepository: PaymentTransactionRepository,
    private readonly paymentSimulator: PaymentSimulatorService,
    private readonly logger: AppLogger
  ) {
    super();
  }

  async process(job: Job<PaymentProcessingJobData, void>) {
    const { transactionId, amount, paymentMethod, cardDetails } = job.data;
    this.logger.log(`Processing payment for transaction ${transactionId}`);

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
        this.logger.log(`Payment successful for transaction ${transactionId}`);
      } else {
        await this.paymentRepository.updateStatus(transactionId, 'failed');
        this.logger.warn(`Payment failed for transaction ${transactionId}: ${result.errorCode}`);
        throw new Error(`Payment failed: ${result.errorCode}`);
      }
    } catch (error) {
      this.logger.error(`Error processing payment for transaction ${transactionId}`, {
        error,
        transactionId,
      });
      await this.paymentRepository.updateStatus(transactionId, 'failed');
      throw new Error(`Failed to process payment for transaction ID ${transactionId}`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<PaymentProcessingJobData>, error: Error) {
    this.logger.error(`Payment processing job failed: ${job.id}`, {
      job: job.data,
      error,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<PaymentProcessingJobData>) {
    this.logger.log(`Payment processing job completed: ${job.id}`, {
      transactionId: job.data.transactionId,
    });
  }
}