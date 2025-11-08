import { Injectable } from '@nestjs/common';
import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';
import { OrderPurchaseOrderItem } from '../../persistence/entity/order-purchase-order-item.entity';
import { OrderStatus } from '../model/order-status.model';

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
    const currentStatus = OrderStatus.fromString(order.status);
    return currentStatus.allowsCancellation();
  }

  /**
   * Domain Logic: Check if order can be modified
   */
  canModifyOrder(order: OrderPurchaseOrder): boolean {
    const currentStatus = OrderStatus.fromString(order.status);
    return currentStatus.allowsModification();
  }

  /**
   * Domain Logic: Check if order needs attention
   */
  orderNeedsAttention(order: OrderPurchaseOrder): boolean {
    const currentStatus = OrderStatus.fromString(order.status);
    return currentStatus.needsAttention();
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
  validateStatusTransition(currentStatus: string, newStatus: string): void {
    const current = OrderStatus.fromString(currentStatus);
    const target = OrderStatus.fromString(newStatus);

    if (!current.canTransitionTo(target)) {
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
      const orderItem = new OrderPurchaseOrderItem();
      orderItem.productId = item.productId;
      orderItem.productName = item.productName;
      orderItem.productSku = item.productSku || '';
      orderItem.unitPrice = item.unitPrice;
      orderItem.quantity = item.quantity;
      orderItem.productAttributes = item.productAttributes || {};
      return orderItem;
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

    if (paymentResult.status === 'completed') {
      order.status = OrderStatus.PAID.getValue();
    } else if (paymentResult.status === 'failed') {
      order.status = OrderStatus.PAYMENT_FAILED.getValue();
    } else {
      order.status = OrderStatus.PENDING_PAYMENT.getValue();
    }
  }

  /**
   * Domain Logic: Format order summary for display
   */
  formatOrderSummary(order: OrderPurchaseOrder): string {
    const status = OrderStatus.fromString(order.status);
    return `${order.orderNumber} - ${status.getDescription()} - R$ ${order.totalAmount.toFixed(2)}`;
  }

  /**
   * Domain Logic: Check if order is eligible for refund
   */
  isEligibleForRefund(order: OrderPurchaseOrder): boolean {
    const currentStatus = OrderStatus.fromString(order.status);
    
    // Business rule: Can only refund delivered orders within 30 days
    if (!currentStatus.equals(OrderStatus.DELIVERED)) {
      return false;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return order.createdAt > thirtyDaysAgo;
  }
}