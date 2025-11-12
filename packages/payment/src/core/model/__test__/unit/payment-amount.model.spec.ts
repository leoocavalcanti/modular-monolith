import { PaymentAmount } from '../../payment-amount.model';

describe('PaymentAmount', () => {
  describe('constructor', () => {
    it('should create payment amount with valid values', () => {
      // Act
      const amount = new PaymentAmount(100.50, 'BRL');

      // Assert
      expect(amount.getValue()).toBe(100.50);
      expect(amount.getCurrency()).toBe('BRL');
    });

    it('should round value to 2 decimal places', () => {
      // Act
      const amount = new PaymentAmount(100.456, 'BRL');

      // Assert
      expect(amount.getValue()).toBe(100.46);
    });

    it('should convert currency to uppercase', () => {
      // Act
      const amount = new PaymentAmount(100, 'brl');

      // Assert
      expect(amount.getCurrency()).toBe('BRL');
    });

    it('should use default currency when not provided', () => {
      // Act
      const amount = new PaymentAmount(100);

      // Assert
      expect(amount.getCurrency()).toBe('BRL');
    });

    it('should throw error for negative amounts', () => {
      // Act & Assert
      expect(() => new PaymentAmount(-10, 'BRL')).toThrow(
        'Payment amount cannot be negative'
      );
    });

    it('should throw error for zero amounts', () => {
      // Act & Assert
      expect(() => new PaymentAmount(0, 'BRL')).toThrow(
        'Payment amount cannot be zero'
      );
    });

    it('should throw error for empty currency', () => {
      // Act & Assert
      expect(() => new PaymentAmount(100, '')).toThrow(
        'Currency is required'
      );
    });

    it('should throw error for whitespace-only currency', () => {
      // Act & Assert
      expect(() => new PaymentAmount(100, '   ')).toThrow(
        'Currency is required'
      );
    });
  });

  describe('toDisplayString', () => {
    it('should format BRL currency correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100.50, 'BRL');

      // Act
      const display = amount.toDisplayString();

      // Assert
      expect(display).toBe('R$ 100,50');
    });

    it('should format USD currency correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100.50, 'USD');

      // Act
      const display = amount.toDisplayString();

      // Assert
      expect(display).toBe('$ 100.50');
    });

    it('should format EUR currency correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100.50, 'EUR');

      // Act
      const display = amount.toDisplayString();

      // Assert
      expect(display).toBe('€ 100.50');
    });

    it('should format unknown currency with generic format', () => {
      // Arrange
      const amount = new PaymentAmount(100.50, 'JPY');

      // Act
      const display = amount.toDisplayString();

      // Assert
      expect(display).toBe('JPY 100.50');
    });

    it('should handle whole numbers correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const display = amount.toDisplayString();

      // Assert
      expect(display).toBe('R$ 100,00');
    });
  });

  describe('isWithinPaymentLimits', () => {
    it('should return true for amounts within limits', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const result = amount.isWithinPaymentLimits();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for minimum allowed amount', () => {
      // Arrange
      const amount = new PaymentAmount(1.00, 'BRL');

      // Act
      const result = amount.isWithinPaymentLimits();

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for maximum allowed amount', () => {
      // Arrange
      const amount = new PaymentAmount(50000.00, 'BRL');

      // Act
      const result = amount.isWithinPaymentLimits();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for amounts below minimum', () => {
      // Arrange
      const amount = new PaymentAmount(0.99, 'BRL');

      // Act
      const result = amount.isWithinPaymentLimits();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for amounts above maximum', () => {
      // Arrange
      const amount = new PaymentAmount(50000.01, 'BRL');

      // Act
      const result = amount.isWithinPaymentLimits();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('calculateProcessingFee', () => {
    it('should calculate credit card fee correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const fee = amount.calculateProcessingFee('credit_card');

      // Assert
      expect(fee.getValue()).toBe(2.99);
      expect(fee.getCurrency()).toBe('BRL');
    });

    it('should calculate debit card fee correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const fee = amount.calculateProcessingFee('debit_card');

      // Assert
      expect(fee.getValue()).toBe(1.99);
      expect(fee.getCurrency()).toBe('BRL');
    });

    it('should calculate PIX fee correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const fee = amount.calculateProcessingFee('pix');

      // Assert
      expect(fee.getValue()).toBe(0.50);
      expect(fee.getCurrency()).toBe('BRL');
    });

    it('should calculate boleto fee correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const fee = amount.calculateProcessingFee('boleto');

      // Assert
      expect(fee.getValue()).toBe(1.50);
      expect(fee.getCurrency()).toBe('BRL');
    });

    it('should use default fee for unknown payment method', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const fee = amount.calculateProcessingFee('unknown_method');

      // Assert
      expect(fee.getValue()).toBe(3.00); // 3% default
      expect(fee.getCurrency()).toBe('BRL');
    });

    it('should handle case insensitive payment methods', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const fee = amount.calculateProcessingFee('CREDIT_CARD');

      // Assert
      expect(fee.getValue()).toBe(2.99);
    });

    it('should calculate fee for different currencies', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'USD');

      // Act
      const fee = amount.calculateProcessingFee('credit_card');

      // Assert
      expect(fee.getValue()).toBe(2.99);
      expect(fee.getCurrency()).toBe('USD');
    });
  });

  describe('equals', () => {
    it('should return true for equal amounts', () => {
      // Arrange
      const amount1 = new PaymentAmount(100.50, 'BRL');
      const amount2 = new PaymentAmount(100.50, 'BRL');

      // Act
      const result = amount1.equals(amount2);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for different values', () => {
      // Arrange
      const amount1 = new PaymentAmount(100.50, 'BRL');
      const amount2 = new PaymentAmount(100.51, 'BRL');

      // Act
      const result = amount1.equals(amount2);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for different currencies', () => {
      // Arrange
      const amount1 = new PaymentAmount(100.50, 'BRL');
      const amount2 = new PaymentAmount(100.50, 'USD');

      // Act
      const result = amount1.equals(amount2);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('fromCents', () => {
    it('should create payment amount from cents correctly', () => {
      // Act
      const amount = PaymentAmount.fromCents(10050, 'BRL');

      // Assert
      expect(amount.getValue()).toBe(100.50);
      expect(amount.getCurrency()).toBe('BRL');
    });

    it('should use default currency when not provided', () => {
      // Act
      const amount = PaymentAmount.fromCents(10050);

      // Assert
      expect(amount.getValue()).toBe(100.50);
      expect(amount.getCurrency()).toBe('BRL');
    });

    it('should handle zero cents', () => {
      // Act & Assert
      expect(() => PaymentAmount.fromCents(0)).toThrow(
        'Payment amount cannot be zero'
      );
    });
  });

  describe('toCents', () => {
    it('should convert amount to cents correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100.50, 'BRL');

      // Act
      const cents = amount.toCents();

      // Assert
      expect(cents).toBe(10050);
    });

    it('should handle whole numbers correctly', () => {
      // Arrange
      const amount = new PaymentAmount(100, 'BRL');

      // Act
      const cents = amount.toCents();

      // Assert
      expect(cents).toBe(10000);
    });

    it('should handle decimal precision correctly', () => {
      // Arrange
      const amount = new PaymentAmount(1.01, 'BRL');

      // Act
      const cents = amount.toCents();

      // Assert
      expect(cents).toBe(101);
    });
  });
});