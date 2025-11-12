import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProcessingService } from '../../payment-processing.service';
import { PaymentSimulatorService } from '../../payment-simulator.service';
import { PaymentAmount } from '../../../model/payment-amount.model';
import { PaymentStatus } from '../../../enum/payment-status.enum';
import { paymentTransactionFactory } from '../../../../../__test__/factory/payment-transaction.test-factory';

describe('PaymentProcessingService', () => {
  let service: PaymentProcessingService;
  let mockPaymentSimulator: jest.Mocked<PaymentSimulatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessingService,
        {
          provide: PaymentSimulatorService,
          useValue: {
            simulatePayment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentProcessingService>(PaymentProcessingService);
    mockPaymentSimulator = module.get<PaymentSimulatorService>(
      PaymentSimulatorService
    ) as jest.Mocked<PaymentSimulatorService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyPaymentDetailsToTransaction', () => {
    it('should apply successful payment details correctly', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.PENDING,
      });
      const simulationResult = {
        success: true,
        transactionId: 'txn_123',
        additionalData: {
          lastFourDigits: '1234',
          cardBrand: 'VISA',
        },
      };

      // Act
      service.applyPaymentDetailsToTransaction(transaction, simulationResult, 'credit_card');

      // Assert
      expect(transaction.status).toBe(PaymentStatus.SUCCESS);
      expect(transaction.transactionId).toBe('txn_123');
      expect(transaction.processedAt).toBeInstanceOf(Date);
      expect(transaction.cardDetails?.lastFourDigits).toBe('1234');
      expect(transaction.cardDetails?.cardBrand).toBe('VISA');
      expect(transaction.metadata).toBe(simulationResult.additionalData);
    });

    it('should apply PIX payment details correctly', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.PENDING,
      });
      const simulationResult = {
        success: true,
        transactionId: 'txn_pix_123',
        additionalData: {
          pixKey: 'user@example.com',
          qrCode: 'pix-qr-code-data',
          expiresAt: new Date(),
        },
      };

      // Act
      service.applyPaymentDetailsToTransaction(transaction, simulationResult, 'pix');

      // Assert
      expect(transaction.status).toBe(PaymentStatus.SUCCESS);
      expect(transaction.pixDetails?.pixKey).toBe('user@example.com');
      expect(transaction.pixDetails?.qrCode).toBe('pix-qr-code-data');
      expect(transaction.pixDetails?.expiresAt).toBeInstanceOf(Date);
    });

    it('should apply boleto payment details correctly', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.PENDING,
      });
      const simulationResult = {
        success: true,
        transactionId: 'txn_boleto_123',
        additionalData: {
          barcode: '12345678901234567890123456789012345678901234',
          digitalLine: '1234567890123456789012345678901234567890123456789',
          expiresAt: new Date(),
        },
      };

      // Act
      service.applyPaymentDetailsToTransaction(transaction, simulationResult, 'boleto');

      // Assert
      expect(transaction.status).toBe(PaymentStatus.SUCCESS);
      expect(transaction.boletoDetails?.barcode).toBe('12345678901234567890123456789012345678901234');
      expect(transaction.boletoDetails?.digitalLine).toBe('1234567890123456789012345678901234567890123456789');
      expect(transaction.boletoDetails?.expiresAt).toBeInstanceOf(Date);
    });

    it('should apply failed payment details correctly', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.PENDING,
      });
      const simulationResult = {
        success: false,
        errorCode: 'INSUFFICIENT_FUNDS',
        errorMessage: 'Insufficient funds on card',
      };

      // Act
      service.applyPaymentDetailsToTransaction(transaction, simulationResult, 'credit_card');

      // Assert
      expect(transaction.status).toBe(PaymentStatus.FAILED);
      expect(transaction.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(transaction.errorMessage).toBe('Insufficient funds on card');
      expect(transaction.processedAt).toBeInstanceOf(Date);
    });
  });

  describe('validatePaymentAmount', () => {
    it('should validate valid payment amount successfully', () => {
      // Arrange
      const amount = 100.50;
      const currency = 'BRL';

      // Act
      const paymentAmount = service.validatePaymentAmount(amount, currency);

      // Assert
      expect(paymentAmount).toBeInstanceOf(PaymentAmount);
      expect(paymentAmount.getValue()).toBe(100.50);
      expect(paymentAmount.getCurrency()).toBe('BRL');
    });

    it('should throw error for amount outside limits', () => {
      // Arrange
      const amount = 100000; // Above the 50,000 limit

      // Act & Assert
      expect(() => service.validatePaymentAmount(amount)).toThrow(
        'Payment amount is outside allowed limits'
      );
    });

    it('should throw error for zero amount', () => {
      // Act & Assert
      expect(() => service.validatePaymentAmount(0)).toThrow(
        'Payment amount cannot be zero'
      );
    });
  });

  describe('calculateProcessingFee', () => {
    it('should calculate credit card processing fee correctly', () => {
      // Arrange
      const amount = 100;
      const paymentMethod = 'credit_card';

      // Act
      const fee = service.calculateProcessingFee(amount, paymentMethod);

      // Assert
      expect(fee).toBe(2.99); // 2.99% of 100
    });

    it('should calculate PIX processing fee correctly', () => {
      // Arrange
      const amount = 100;
      const paymentMethod = 'pix';

      // Act
      const fee = service.calculateProcessingFee(amount, paymentMethod);

      // Assert
      expect(fee).toBe(0.50); // 0.5% of 100
    });

    it('should calculate debit card processing fee correctly', () => {
      // Arrange
      const amount = 100;
      const paymentMethod = 'debit_card';

      // Act
      const fee = service.calculateProcessingFee(amount, paymentMethod);

      // Assert
      expect(fee).toBe(1.99); // 1.99% of 100
    });

    it('should calculate boleto processing fee correctly', () => {
      // Arrange
      const amount = 100;
      const paymentMethod = 'boleto';

      // Act
      const fee = service.calculateProcessingFee(amount, paymentMethod);

      // Assert
      expect(fee).toBe(1.50); // 1.5% of 100
    });
  });

  describe('requiresImmediateProcessing', () => {
    it('should return true for PIX payments', () => {
      // Act
      const result = service.requiresImmediateProcessing('pix');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for credit card payments', () => {
      // Act
      const result = service.requiresImmediateProcessing('credit_card');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for other payment methods', () => {
      // Act
      const result = service.requiresImmediateProcessing('boleto');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('canRetryPayment', () => {
    it('should return true for failed payments with retries remaining', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.FAILED,
        errorCode: 'TIMEOUT',
        metadata: { retryCount: 1 },
      });

      // Act
      const canRetry = service.canRetryPayment(transaction, 3);

      // Assert
      expect(canRetry).toBe(true);
    });

    it('should return false for non-failed payments', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.SUCCESS,
      });

      // Act
      const canRetry = service.canRetryPayment(transaction);

      // Assert
      expect(canRetry).toBe(false);
    });

    it('should return false for non-retryable error codes', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.FAILED,
        errorCode: 'INVALID_CARD',
        metadata: { retryCount: 0 },
      });

      // Act
      const canRetry = service.canRetryPayment(transaction);

      // Assert
      expect(canRetry).toBe(false);
    });

    it('should return false when max retries exceeded', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.FAILED,
        errorCode: 'TIMEOUT',
        metadata: { retryCount: 3 },
      });

      // Act
      const canRetry = service.canRetryPayment(transaction, 3);

      // Assert
      expect(canRetry).toBe(false);
    });

    it('should handle missing metadata gracefully', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        status: PaymentStatus.FAILED,
        errorCode: 'TIMEOUT',
        metadata: {},
      });

      // Act
      const canRetry = service.canRetryPayment(transaction);

      // Assert
      expect(canRetry).toBe(true);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should return correct delay for first retry', () => {
      // Act
      const delay = service.calculateRetryDelay(1);

      // Assert
      expect(delay).toBe(5000); // 5 seconds
    });

    it('should return correct delay for second retry', () => {
      // Act
      const delay = service.calculateRetryDelay(2);

      // Assert
      expect(delay).toBe(15000); // 15 seconds
    });

    it('should return correct delay for third retry', () => {
      // Act
      const delay = service.calculateRetryDelay(3);

      // Assert
      expect(delay).toBe(60000); // 60 seconds
    });

    it('should return max delay for retries beyond configured attempts', () => {
      // Act
      const delay = service.calculateRetryDelay(5);

      // Assert
      expect(delay).toBe(60000); // Max 60 seconds
    });
  });

  describe('maskCardNumber', () => {
    it('should mask card number correctly', () => {
      // Arrange
      const cardNumber = '1234567812345678';

      // Act
      const masked = service.maskCardNumber(cardNumber);

      // Assert
      expect(masked).toBe('**** **** **** 5678');
    });

    it('should handle short card numbers', () => {
      // Arrange
      const cardNumber = '123';

      // Act
      const masked = service.maskCardNumber(cardNumber);

      // Assert
      expect(masked).toBe('****');
    });

    it('should handle empty card number', () => {
      // Arrange
      const cardNumber = '';

      // Act
      const masked = service.maskCardNumber(cardNumber);

      // Assert
      expect(masked).toBe('****');
    });

    it('should handle null card number', () => {
      // Act
      const masked = service.maskCardNumber(null as any);

      // Assert
      expect(masked).toBe('****');
    });
  });

  describe('formatPaymentDisplay', () => {
    it('should format credit card payment display correctly', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        amount: 150.75,
        currency: 'BRL',
        paymentMethod: 'credit_card' as any,
      });

      // Act
      const display = service.formatPaymentDisplay(transaction);

      // Assert
      expect(display).toBe('R$ 150,75 via CREDIT CARD');
    });

    it('should format PIX payment display correctly', () => {
      // Arrange
      const transaction = paymentTransactionFactory.build({
        amount: 99.99,
        currency: 'BRL',
        paymentMethod: 'pix' as any,
      });

      // Act
      const display = service.formatPaymentDisplay(transaction);

      // Assert
      expect(display).toBe('R$ 99,99 via PIX');
    });
  });
});