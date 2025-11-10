import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { PaymentTransaction } from '../../persistence/entity/payment-transaction.entity';
import { PaymentTransactionRepository } from '../../persistence/repository/payment-transaction.repository';
import { PaymentProcessingProducer } from '../../queue/producer/payment-processing.queue-producer';
import { PaymentSimulatorService } from '../service/payment-simulator.service';
import { PaymentProcessingService } from '../service/payment-processing.service';
import { PaymentMethod } from '../enum/payment-method.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

export interface ProcessPaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  };
  orderId: string;
  customerEmail: string;
}

export interface ProcessPaymentResult {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  queueJobId?: string;
}

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    private readonly paymentRepository: PaymentTransactionRepository,
    private readonly paymentSimulator: PaymentSimulatorService,
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly paymentQueue: PaymentProcessingProducer,
    private readonly logger: AppLogger
  ) {}

  async execute(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
    this.logger.log(`Processing payment for order ${request.orderId}`, {
      amount: request.amount,
      paymentMethod: request.paymentMethod,
      orderId: request.orderId,
    });

    return await runInTransaction(
      async () => {
        // Validate amount using domain logic
        const paymentAmount = this.paymentProcessingService.validatePaymentAmount(
          request.amount, 
          'BRL'
        );

        // Create payment transaction
        const transaction = new PaymentTransaction({
          amount: paymentAmount.getValue(),
          paymentMethod: request.paymentMethod,
          cardDetails: request.cardDetails ? {
            lastFourDigits: this.paymentProcessingService.maskCardNumber(request.cardDetails.cardNumber),
            cardholderName: request.cardDetails.holderName,
          } : undefined,
          orderId: request.orderId,
          customerEmail: request.customerEmail,
          status: PaymentStatus.PENDING,
          createdAt: new Date(),
        });

        const savedTransaction = await this.paymentRepository.save(transaction);

        // Check if requires immediate processing (domain logic)
        if (this.paymentProcessingService.requiresImmediateProcessing(request.paymentMethod)) {
          const result = await this.paymentSimulator.simulatePayment(
            request.amount,
            request.paymentMethod,
            request.cardDetails
          );

          // Apply domain logic to update transaction
          this.paymentProcessingService.applyPaymentDetailsToTransaction(
            savedTransaction,
            result,
            request.paymentMethod
          );

          await this.paymentRepository.save(savedTransaction);

          this.logger.log(`PIX payment processed immediately for transaction ${savedTransaction.id}`, {
            transactionId: savedTransaction.id,
            success: result.success,
            errorCode: result.errorCode,
          });

          return {
            transactionId: savedTransaction.id,
            status: savedTransaction.status,
            amount: savedTransaction.amount,
            paymentMethod: savedTransaction.paymentMethod,
            createdAt: savedTransaction.createdAt,
          };
        }

        // For async payments (cards, boleto), queue for processing
        const queueJobId = await this.paymentQueue.processPayment(savedTransaction);

        savedTransaction.status = PaymentStatus.PROCESSING;
        await this.paymentRepository.save(savedTransaction);

        this.logger.log(`Payment queued for async processing`, {
          transactionId: savedTransaction.id,
          queueJobId,
          paymentMethod: request.paymentMethod,
        });

        return {
          transactionId: savedTransaction.id,
          status: savedTransaction.status,
          amount: savedTransaction.amount,
          paymentMethod: savedTransaction.paymentMethod,
          createdAt: savedTransaction.createdAt,
          queueJobId,
        };
      },
      {
        connectionName: 'payment',
      }
    );
  }
}