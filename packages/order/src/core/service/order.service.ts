import { Injectable } from '@nestjs/common';
import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';
import { OrderPurchaseOrderItem } from '../../persistence/entity/order-purchase-order-item.entity';
import { OrderStatus } from '../enum/order-status.enum';

/**
 * Domain Service: OrderService
 * 
 * Contains pure domain logic for order processing.
 * No transactions, orchestrations, or infrastructure concerns.
 */
@Injectable()
export class OrderService {

  /**
   * Domain Logic: Generate order number
   */
  generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  /**
   * Domain Logic: Calculate shipping amount based on items
   */
  calculateShippingAmount(items: Array<{ quantity: number; unitPrice: number }>): number {
    const totalWeight = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Business rules for shipping calculation
    if (totalValue >= 100) {
      return 0; // Free shipping for orders over R$ 100
    }

    if (totalWeight <= 1) {
      return 9.90; // Light package
    } else if (totalWeight <= 5) {
      return 15.90; // Medium package
    } else {
      return 25.90; // Heavy package
    }
  }

  /**
   * Domain Logic: Calculate tax amount
   */
  calculateTaxAmount(items: Array<{ quantity: number; unitPrice: number }>): number {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    // Simplified tax calculation (would be more complex in reality)
    return subtotal * 0.0; // 0% for now, could be configurable per region
  }

  /**
   * Domain Logic: Calculate order total
   */
  calculateOrderTotal(
    items: Array<{ quantity: number; unitPrice: number }>,
    shippingAmount: number,
    taxAmount: number
  ): number {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return subtotal + shippingAmount + taxAmount;
  }

  /**
   * Domain Logic: Validate order items
   */
  validateOrderItems(items: Array<{ productId: string; quantity: number; unitPrice: number }>): void {
    if (!items || items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for product ${item.productId}`);
      }

      if (item.unitPrice <= 0) {
        throw new Error(`Invalid price for product ${item.productId}`);
      }
    }
  }

  /**
   * Domain Logic: Check if order can be cancelled
   */
  canCancelOrder(order: OrderPurchaseOrder): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PENDING_PAYMENT].includes(order.status);
  }

  /**
   * Domain Logic: Check if order can be modified
   */
  canModifyOrder(order: OrderPurchaseOrder): boolean {
    return [OrderStatus.PENDING, OrderStatus.PENDING_PAYMENT].includes(order.status);
  }

  /**
   * Domain Logic: Check if order needs attention
   */
  orderNeedsAttention(order: OrderPurchaseOrder): boolean {
    return [OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED].includes(order.status);
  }

  /**
   * Domain Logic: Get estimated delivery date
   */
  calculateEstimatedDeliveryDate(shippingAddress: any): Date {
    const deliveryDate = new Date();
    
    // Business rules for delivery time
    if (shippingAddress.state === 'SP') {
      deliveryDate.setDate(deliveryDate.getDate() + 2); // 2 days for São Paulo
    } else if (['RJ', 'MG', 'PR', 'SC', 'RS'].includes(shippingAddress.state)) {
      deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days for nearby states
    } else {
      deliveryDate.setDate(deliveryDate.getDate() + 10); // 10 days for distant states
    }

    return deliveryDate;
  }

  /**
   * Domain Logic: Validate status transition
   */
  validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    // Simple validation - can expand logic later
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.PAID]: [OrderStatus.PROCESSING],
      [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.PAYMENT_FAILED, OrderStatus.CANCELLED],
    };
    
    const allowed = allowedTransitions[currentStatus]?.includes(newStatus);
    if (!allowed) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  /**
   * Domain Logic: Create order items from cart items
   */
  createOrderItemsFromCartItems(
    cartItems: Array<{
      productId: string;
      productName: string;
      productSku?: string;
      unitPrice: number;
      quantity: number;
      productAttributes?: Record<string, any>;
    }>
  ): OrderPurchaseOrderItem[] {
    this.validateOrderItems(cartItems);

    return cartItems.map(item => {
      return new OrderPurchaseOrderItem({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku || '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        productAttributes: item.productAttributes || {},
      });
    });
  }

  /**
   * Domain Logic: Apply payment result to order
   */
  applyPaymentResultToOrder(
    order: OrderPurchaseOrder, 
    paymentResult: { status: string; transactionId: string }
  ): void {
    order.paymentTransactionId = paymentResult.transactionId;

    if (paymentResult.status === 'completed' || paymentResult.status === 'success') {
      order.status = OrderStatus.PAID;
    } else if (paymentResult.status === 'failed') {
      order.status = OrderStatus.PAYMENT_FAILED;
    } else {
      order.status = OrderStatus.PENDING_PAYMENT;
    }
  }

  /**
   * Domain Logic: Format order summary for display
   */
  formatOrderSummary(order: OrderPurchaseOrder): string {
    return `${order.orderNumber} - ${order.status} - R$ ${order.totalAmount.toFixed(2)}`;
  }

  /**
   * Domain Logic: Check if order is eligible for refund
   */
  isEligibleForRefund(order: OrderPurchaseOrder): boolean {
    // Business rule: Can only refund delivered orders within 30 days
    if (order.status !== OrderStatus.DELIVERED) {
      return false;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return order.createdAt > thirtyDaysAgo;
  }

  // Methods needed by controllers/facades
  async getUserOrdersByStatus(_userId: string, _status: OrderStatus): Promise<OrderPurchaseOrder[]> {
    // TODO: Implement with repository
    return [];
  }

  async getUserOrders(_userId: string): Promise<OrderPurchaseOrder[]> {
    // TODO: Implement with repository
    return [];
  }

  async getOrderById(_orderId: string): Promise<OrderPurchaseOrder | null> {
    // TODO: Implement with repository
    return null;
  }

  async createOrder(_orderData: any): Promise<OrderPurchaseOrder> {
    // TODO: Implement with repository
    throw new Error('Not implemented');
  }

  async updateOrderStatus(_orderId: string, _status: OrderStatus): Promise<OrderPurchaseOrder> {
    // TODO: Implement with repository
    throw new Error('Not implemented');
  }

  async updatePaymentStatus(_orderId: string, _paymentStatus: any): Promise<OrderPurchaseOrder> {
    // TODO: Implement with repository
    throw new Error('Not implemented');
  }
}