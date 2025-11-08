import { Injectable, Logger } from '@nestjs/common';
import { PaymentMethod } from '../enum/payment-method.enum';
import { PaymentStatus } from '../enum/payment-status.enum';

export interface SimulationResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  additionalData?: Record<string, any>;
}

@Injectable()
export class PaymentSimulatorService {
  private readonly logger = new Logger(PaymentSimulatorService.name);

  async simulatePayment(
    amount: number,
    paymentMethod: PaymentMethod,
    cardDetails?: any
  ): Promise<SimulationResult> {
    this.logger.log(`Simulating payment: ${paymentMethod} - Amount: ${amount}`);

    await this.simulateProcessingDelay();

    switch (paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return this.simulateCardPayment(amount, cardDetails);

      case PaymentMethod.PIX:
        return this.simulatePixPayment(amount);

      case PaymentMethod.BOLETO:
        return this.simulateBoletoPayment(amount);

      default:
        return {
          success: false,
          errorCode: 'UNSUPPORTED_METHOD',
          errorMessage: 'Payment method not supported',
        };
    }
  }

  private async simulateCardPayment(amount: number, cardDetails?: any): Promise<SimulationResult> {
    if (!cardDetails || !cardDetails.cardNumber) {
      return {
        success: false,
        errorCode: 'INVALID_CARD',
        errorMessage: 'Card details are required',
      };
    }

    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');

    if (cardNumber.endsWith('0000')) {
      return {
        success: false,
        errorCode: 'INSUFFICIENT_FUNDS',
        errorMessage: 'Insufficient funds',
      };
    }

    if (cardNumber.endsWith('1111')) {
      return {
        success: false,
        errorCode: 'DECLINED',
        errorMessage: 'Card declined by issuer',
      };
    }

    if (cardNumber.length !== 16) {
      return {
        success: false,
        errorCode: 'INVALID_CARD_NUMBER',
        errorMessage: 'Invalid card number',
      };
    }

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return {
      success: true,
      transactionId,
      additionalData: {
        lastFourDigits: cardNumber.slice(-4),
        cardBrand: this.getCardBrand(cardNumber),
        authorizationCode: `AUTH_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    };
  }

  private async simulatePixPayment(amount: number): Promise<SimulationResult> {
    const transactionId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const pixKey = `${Math.random().toString().substring(2, 11)}-${Math.random().toString().substring(2, 6)}-${Math.random().toString().substring(2, 6)}-${Math.random().toString().substring(2, 6)}-${Math.random().toString().substring(2, 13)}`;
    
    const qrCode = `00020126580014br.gov.bcb.pix0136${pixKey}5204000053039865802BR5925ECOMMERCE SIMULATOR6009SAO PAULO62070503***6304`;

    return {
      success: true,
      transactionId,
      additionalData: {
        pixKey,
        qrCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    };
  }

  private async simulateBoletoPayment(amount: number): Promise<SimulationResult> {
    const transactionId = `boleto_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const barcode = `23790000000${amount.toFixed(2).replace('.', '')}000000000000000000000000000`;
    const digitalLine = `23790.00009 00000.000001 00000.000005 0 00000000${amount.toFixed(2).replace('.', '')}`;

    return {
      success: true,
      transactionId,
      additionalData: {
        barcode,
        digitalLine,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    };
  }

  private getCardBrand(cardNumber: string): string {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5')) return 'MasterCard';
    if (cardNumber.startsWith('3')) return 'American Express';
    return 'Unknown';
  }

  private async simulateProcessingDelay(): Promise<void> {
    const delay = Math.random() * 2000 + 500;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}