import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSimulatorService } from '../../payment-simulator.service';
import { PaymentMethod } from '../../../enum/payment-method.enum';

describe('PaymentSimulatorService', () => {
  let service: PaymentSimulatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentSimulatorService],
    }).compile();

    service = module.get<PaymentSimulatorService>(PaymentSimulatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('simulatePayment', () => {
    describe('Credit Card Payment', () => {
      const cardDetails = {
        cardNumber: '4111111111111234',
        expiryMonth: 12,
        expiryYear: 2025,
        cvv: '123',
        holderName: 'John Doe',
      };

      it('should approve payment for valid card', async () => {
        // Arrange
        const amount = 100.00;

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.CREDIT_CARD,
          cardDetails
        );

        // Assert
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeDefined();
        expect(result.additionalData?.['lastFourDigits']).toBe('1234');
        expect(result.additionalData?.['cardBrand']).toBe('Visa');
        expect(result.additionalData?.['authorizationCode']).toBeDefined();
      });

      it('should decline payment for card ending in 0000 (insufficient funds)', async () => {
        // Arrange
        const amount = 100.00;
        const insufficientFundsCard = {
          ...cardDetails,
          cardNumber: '4111111111110000',
        };

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.CREDIT_CARD,
          insufficientFundsCard
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
        expect(result.errorMessage).toBe('Insufficient funds');
      });

      it('should decline payment for card ending in 1111 (card declined)', async () => {
        // Arrange
        const amount = 100.00;
        const declinedCard = {
          ...cardDetails,
          cardNumber: '4111111111111111',
        };

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.CREDIT_CARD,
          declinedCard
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('DECLINED');
        expect(result.errorMessage).toBe('Card declined by issuer');
      });

      it('should reject payment for invalid card number', async () => {
        // Arrange
        const amount = 100.00;
        const invalidCard = {
          ...cardDetails,
          cardNumber: '123', // Too short
        };

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.CREDIT_CARD,
          invalidCard
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_CARD_NUMBER');
        expect(result.errorMessage).toBe('Invalid card number');
      });

      it('should require card details for card payment', async () => {
        // Arrange
        const amount = 100.00;

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.CREDIT_CARD,
          undefined
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_CARD');
        expect(result.errorMessage).toBe('Card details are required');
      });
    });

    describe('PIX Payment', () => {
      it('should approve PIX payment', async () => {
        // Arrange
        const amount = 100.00;

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.PIX
        );

        // Assert
        expect(result.success).toBe(true);
        expect(result.transactionId).toMatch(/^pix_/);
        expect(result.additionalData?.['pixKey']).toBeDefined();
        expect(result.additionalData?.['qrCode']).toBeDefined();
        expect(result.additionalData?.['expiresAt']).toBeDefined();
      });
    });

    describe('Boleto Payment', () => {
      it('should approve boleto payment', async () => {
        // Arrange
        const amount = 150.75;

        // Act
        const result = await service.simulatePayment(
          amount,
          PaymentMethod.BOLETO
        );

        // Assert
        expect(result.success).toBe(true);
        expect(result.transactionId).toMatch(/^boleto_/);
        expect(result.additionalData?.['barcode']).toBeDefined();
        expect(result.additionalData?.['digitalLine']).toBeDefined();
        expect(result.additionalData?.['expiresAt']).toBeDefined();
      });
    });

    describe('Unsupported Payment Method', () => {
      it('should reject unsupported payment method', async () => {
        // Arrange
        const amount = 100.00;

        // Act
        const result = await service.simulatePayment(
          amount,
          'UNSUPPORTED' as PaymentMethod
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('UNSUPPORTED_METHOD');
        expect(result.errorMessage).toBe('Payment method not supported');
      });
    });
  });
});