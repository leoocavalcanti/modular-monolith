/**
 * Domain Model: OrderStatus
 * 
 * Represents order status with business rules for valid transitions.
 * This encapsulates the business logic around order lifecycle.
 */
export class OrderStatus {
  public static readonly PENDING_PAYMENT = new OrderStatus('pending_payment');
  public static readonly PAID = new OrderStatus('paid');
  public static readonly PROCESSING = new OrderStatus('processing');
  public static readonly SHIPPED = new OrderStatus('shipped');
  public static readonly DELIVERED = new OrderStatus('delivered');
  public static readonly CANCELLED = new OrderStatus('cancelled');
  public static readonly PAYMENT_FAILED = new OrderStatus('payment_failed');

  private constructor(private readonly value: string) {}

  getValue(): string {
    return this.value;
  }

  /**
   * Business rules: Valid status transitions
   */
  canTransitionTo(newStatus: OrderStatus): boolean {
    const currentStatus = this.value;
    const targetStatus = newStatus.value;

    const validTransitions: Record<string, string[]> = {
      'pending_payment': ['paid', 'cancelled', 'payment_failed'],
      'paid': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [], // Terminal status
      'cancelled': [], // Terminal status
      'payment_failed': ['paid', 'cancelled'], // Can retry payment
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    return allowedTransitions.includes(targetStatus);
  }

  /**
   * Check if status allows order modification
   */
  allowsModification(): boolean {
    return ['pending_payment', 'paid'].includes(this.value);
  }

  /**
   * Check if status allows cancellation
   */
  allowsCancellation(): boolean {
    return ['pending_payment', 'paid', 'processing'].includes(this.value);
  }

  /**
   * Check if order is in a terminal state
   */
  isTerminal(): boolean {
    return ['delivered', 'cancelled'].includes(this.value);
  }

  /**
   * Check if order is successful (completed)
   */
  isSuccessful(): boolean {
    return this.value === 'delivered';
  }

  /**
   * Check if order needs attention (failed states)
   */
  needsAttention(): boolean {
    return ['payment_failed'].includes(this.value);
  }

  /**
   * Get human-readable status description
   */
  getDescription(): string {
    const descriptions: Record<string, string> = {
      'pending_payment': 'Aguardando Pagamento',
      'paid': 'Pago',
      'processing': 'Processando',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
      'payment_failed': 'Pagamento Falhou',
    };

    return descriptions[this.value] || this.value;
  }

  /**
   * Get status priority for sorting (lower = higher priority)
   */
  getPriority(): number {
    const priorities: Record<string, number> = {
      'payment_failed': 1,
      'pending_payment': 2,
      'paid': 3,
      'processing': 4,
      'shipped': 5,
      'delivered': 6,
      'cancelled': 7,
    };

    return priorities[this.value] || 999;
  }

  /**
   * Create from string value
   */
  static fromString(value: string): OrderStatus {
    switch (value.toLowerCase()) {
      case 'pending_payment':
        return OrderStatus.PENDING_PAYMENT;
      case 'paid':
        return OrderStatus.PAID;
      case 'processing':
        return OrderStatus.PROCESSING;
      case 'shipped':
        return OrderStatus.SHIPPED;
      case 'delivered':
        return OrderStatus.DELIVERED;
      case 'cancelled':
        return OrderStatus.CANCELLED;
      case 'payment_failed':
        return OrderStatus.PAYMENT_FAILED;
      default:
        throw new Error(`Invalid order status: ${value}`);
    }
  }

  /**
   * Get next logical status (business flow)
   */
  getNextStatus(): OrderStatus | null {
    const nextStatuses: Record<string, string> = {
      'pending_payment': 'paid',
      'paid': 'processing',
      'processing': 'shipped',
      'shipped': 'delivered',
    };

    const nextValue = nextStatuses[this.value];
    return nextValue ? OrderStatus.fromString(nextValue) : null;
  }

  equals(other: OrderStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}