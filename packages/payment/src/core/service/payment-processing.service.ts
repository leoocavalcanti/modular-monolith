import { Injectable } from '@nestjs/common';
import { PaymentTransaction } from '../../persistence/entity/payment-transaction.entity';
import { PaymentSimulatorService } from './payment-simulator.service';
import { PaymentAmount } from '../model/payment-amount.model';
import { PaymentStatus } from '../enum/payment-status.enum';

/**
 * Domain Service: PaymentProcessingService
 * 
 * Contains pure domain logic for payment processing.
 * No transactions, orchestrations, or infrastructure concerns.
 */
@Injectable()
export class PaymentProcessingService {
  constructor(private readonly paymentSimulator: PaymentSimulatorService) {}

  /**
   * Domain Logic: Apply payment details to transaction entity
   */
  applyPaymentDetailsToTransaction(
    transaction: PaymentTransaction,
    simulationResult: any,
    paymentMethod: string
  ): void {
    if (simulationResult.success) {
      transaction.status = PaymentStatus.SUCCESS;
      transaction.transactionId = simulationResult.transactionId;
      transaction.processedAt = new Date();

      // Business rule: Store payment method specific details
      if (paymentMethod === 'pix' && simulationResult.additionalData) {
        transaction.pixDetails = {
          pixKey: simulationResult.additionalData.pixKey,
          qrCode: simulationResult.additionalData.qrCode,
          expiresAt: simulationResult.additionalData.expiresAt,
        };
      }

      if (paymentMethod === 'boleto' && simulationResult.additionalData) {
        transaction.boletoDetails = {
          barcode: simulationResult.additionalData.barcode,
          digitalLine: simulationResult.additionalData.digitalLine,
          expiresAt: simulationResult.additionalData.expiresAt,
        };
      }

      if (['credit_card', 'debit_card'].includes(paymentMethod) && simulationResult.additionalData) {
        transaction.cardDetails = {
          ...transaction.cardDetails,
          lastFourDigits: simulationResult.additionalData.lastFourDigits,
          cardBrand: simulationResult.additionalData.cardBrand,
        };
      }

      transaction.metadata = simulationResult.additionalData;
    } else {
      transaction.status = PaymentStatus.FAILED;
      transaction.errorCode = simulationResult.errorCode;
      transaction.errorMessage = simulationResult.errorMessage;
      transaction.processedAt = new Date();
    }
  }

  /**
   * Domain Logic: Validate payment amount
   */
  validatePaymentAmount(amount: number, currency: string = 'BRL'): PaymentAmount {
    const paymentAmount = new PaymentAmount(amount, currency);
    
    if (!paymentAmount.isWithinPaymentLimits()) {
      throw new Error('Payment amount is outside allowed limits');
    }

    return paymentAmount;
  }

  /**
   * Domain Logic: Calculate processing fee
   */
  calculateProcessingFee(amount: number, paymentMethod: string, currency: string = 'BRL'): number {
    const paymentAmount = new PaymentAmount(amount, currency);
    const fee = paymentAmount.calculateProcessingFee(paymentMethod);
    return fee.getValue();
  }

  /**
   * Domain Logic: Check if payment method requires immediate processing
   */
  requiresImmediateProcessing(paymentMethod: string): boolean {
    return paymentMethod === 'pix';
  }

  /**
   * Domain Logic: Check if payment can be retried
   */
  canRetryPayment(transaction: PaymentTransaction, maxRetries: number = 3): boolean {
    if (transaction.status !== 'failed') {
      return false;
    }

    // Business rule: Some error codes are not retryable
    const nonRetryableErrors = ['INVALID_CARD', 'FRAUD_DETECTED', 'EXPIRED_CARD'];
    if (nonRetryableErrors.includes(transaction.errorCode || '')) {
      return false;
    }

    // Check retry count (this would come from transaction metadata or separate field)
    const retryCount = typeof transaction.metadata?.['retryCount'] === 'number' 
      ? transaction.metadata['retryCount'] 
      : 0;
    return retryCount < maxRetries;
  }

  /**
   * Domain Logic: Get next retry delay based on attempt number
   */
  calculateRetryDelay(retryAttempt: number): number {
    // Exponential backoff: 5s, 15s, 60s
    const delays = [5000, 15000, 60000];
    return delays[retryAttempt - 1] || 60000;
  }

  /**
   * Domain Logic: Mask card number for security
   */
  maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) {
      return '****';
    }
    return '**** **** **** ' + cardNumber.slice(-4);
  }

  /**
   * Domain Logic: Format payment for display
   */
  formatPaymentDisplay(transaction: PaymentTransaction): string {
    const amount = new PaymentAmount(transaction.amount, transaction.currency || 'BRL');
    const method = transaction.paymentMethod.replace('_', ' ').toUpperCase();
    return `${amount.toDisplayString()} via ${method}`;
  }
}