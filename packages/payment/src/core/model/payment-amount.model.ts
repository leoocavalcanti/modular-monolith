/**
 * Domain Model: PaymentAmount
 * 
 * Represents a monetary amount with currency and validation logic.
 * This is pure domain logic with no external dependencies.
 */
export class PaymentAmount {
  private readonly value: number;
  private readonly currency: string;

  constructor(value: number, currency: string = 'BRL') {
    if (value < 0) {
      throw new Error('Payment amount cannot be negative');
    }

    if (value === 0) {
      throw new Error('Payment amount cannot be zero');
    }

    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency is required');
    }

    this.value = Math.round(value * 100) / 100; // Round to 2 decimal places
    this.currency = currency.toUpperCase();
  }

  getValue(): number {
    return this.value;
  }

  getCurrency(): string {
    return this.currency;
  }

  /**
   * Format amount for display (e.g., "R$ 10,50")
   */
  toDisplayString(): string {
    switch (this.currency) {
      case 'BRL':
        return `R$ ${this.value.toFixed(2).replace('.', ',')}`;
      case 'USD':
        return `$ ${this.value.toFixed(2)}`;
      case 'EUR':
        return `€ ${this.value.toFixed(2)}`;
      default:
        return `${this.currency} ${this.value.toFixed(2)}`;
    }
  }

  /**
   * Check if amount is within payment limits
   */
  isWithinPaymentLimits(): boolean {
    // Business rule: minimum R$ 1,00, maximum R$ 50,000.00
    return this.value >= 1.00 && this.value <= 50000.00;
  }

  /**
   * Calculate payment fee (domain business rule)
   */
  calculateProcessingFee(paymentMethod: string): PaymentAmount {
    let feePercentage: number;

    switch (paymentMethod.toLowerCase()) {
      case 'credit_card':
        feePercentage = 0.0299; // 2.99%
        break;
      case 'debit_card':
        feePercentage = 0.0199; // 1.99%
        break;
      case 'pix':
        feePercentage = 0.005; // 0.5%
        break;
      case 'boleto':
        feePercentage = 0.015; // 1.5%
        break;
      default:
        feePercentage = 0.03; // Default 3%
    }

    const feeAmount = this.value * feePercentage;
    return new PaymentAmount(feeAmount, this.currency);
  }

  /**
   * Check if two amounts are equal
   */
  equals(other: PaymentAmount): boolean {
    return this.value === other.value && this.currency === other.currency;
  }

  /**
   * Create from cents (to avoid floating point issues)
   */
  static fromCents(cents: number, currency: string = 'BRL'): PaymentAmount {
    return new PaymentAmount(cents / 100, currency);
  }

  /**
   * Convert to cents for storage/calculations
   */
  toCents(): number {
    return Math.round(this.value * 100);
  }
}