import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../../order.service';
import { OrderStatus } from '../../../enum/order-status.enum';
import { orderPurchaseOrderFactory, deliveredOrderFactory } from '../../../../../__test__/factory/order-purchase-order.test-factory';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderService],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('generateOrderNumber', () => {
    it('should generate unique order number with correct format', () => {
      // Act
      const orderNumber1 = service.generateOrderNumber();
      const orderNumber2 = service.generateOrderNumber();

      // Assert
      expect(orderNumber1).toMatch(/^ORD\d{13}\d{3}$/);
      expect(orderNumber2).toMatch(/^ORD\d{13}\d{3}$/);
      expect(orderNumber1).not.toBe(orderNumber2);
    });
  });

  describe('calculateShippingAmount', () => {
    it('should return 0 for orders over R$ 100 (free shipping)', () => {
      // Arrange
      const items = [{ quantity: 1, unitPrice: 150 }];

      // Act
      const shippingAmount = service.calculateShippingAmount(items);

      // Assert
      expect(shippingAmount).toBe(0);
    });

    it('should return 9.90 for light packages (weight <= 1)', () => {
      // Arrange
      const items = [{ quantity: 1, unitPrice: 50 }];

      // Act
      const shippingAmount = service.calculateShippingAmount(items);

      // Assert
      expect(shippingAmount).toBe(9.90);
    });

    it('should return 15.90 for medium packages (weight 2-5)', () => {
      // Arrange
      const items = [{ quantity: 3, unitPrice: 20 }];

      // Act
      const shippingAmount = service.calculateShippingAmount(items);

      // Assert
      expect(shippingAmount).toBe(15.90);
    });

    it('should return 25.90 for heavy packages (weight > 5)', () => {
      // Arrange
      const items = [{ quantity: 7, unitPrice: 10 }];

      // Act
      const shippingAmount = service.calculateShippingAmount(items);

      // Assert
      expect(shippingAmount).toBe(25.90);
    });
  });

  describe('calculateTaxAmount', () => {
    it('should return 0% tax for now', () => {
      // Arrange
      const items = [
        { quantity: 2, unitPrice: 50 },
        { quantity: 1, unitPrice: 30 },
      ];

      // Act
      const taxAmount = service.calculateTaxAmount(items);

      // Assert
      expect(taxAmount).toBe(0);
    });
  });

  describe('calculateOrderTotal', () => {
    it('should calculate correct total including items, shipping and tax', () => {
      // Arrange
      const items = [
        { quantity: 2, unitPrice: 50 }, // 100
        { quantity: 1, unitPrice: 30 }, // 30
      ];
      const shippingAmount = 15.90;
      const taxAmount = 0;

      // Act
      const total = service.calculateOrderTotal(items, shippingAmount, taxAmount);

      // Assert
      expect(total).toBe(145.90); // 130 + 15.90 + 0
    });
  });

  describe('validateOrderItems', () => {
    it('should throw error for empty items array', () => {
      // Arrange
      const items: any[] = [];

      // Act & Assert
      expect(() => service.validateOrderItems(items)).toThrow(
        'Order must have at least one item'
      );
    });

    it('should throw error for items with invalid quantity', () => {
      // Arrange
      const items = [
        { productId: 'prod-1', quantity: 0, unitPrice: 50 },
      ];

      // Act & Assert
      expect(() => service.validateOrderItems(items)).toThrow(
        'Invalid quantity for product prod-1'
      );
    });

    it('should throw error for items with invalid price', () => {
      // Arrange
      const items = [
        { productId: 'prod-1', quantity: 1, unitPrice: 0 },
      ];

      // Act & Assert
      expect(() => service.validateOrderItems(items)).toThrow(
        'Invalid price for product prod-1'
      );
    });

    it('should pass validation for valid items', () => {
      // Arrange
      const items = [
        { productId: 'prod-1', quantity: 2, unitPrice: 50 },
        { productId: 'prod-2', quantity: 1, unitPrice: 30 },
      ];

      // Act & Assert
      expect(() => service.validateOrderItems(items)).not.toThrow();
    });
  });

  describe('canCancelOrder', () => {
    it('should return true for PENDING orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PENDING });

      // Act
      const canCancel = service.canCancelOrder(order);

      // Assert
      expect(canCancel).toBe(true);
    });

    it('should return true for CONFIRMED orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.CONFIRMED });

      // Act
      const canCancel = service.canCancelOrder(order);

      // Assert
      expect(canCancel).toBe(true);
    });

    it('should return false for DELIVERED orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.DELIVERED });

      // Act
      const canCancel = service.canCancelOrder(order);

      // Assert
      expect(canCancel).toBe(false);
    });

    it('should return false for SHIPPED orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.SHIPPED });

      // Act
      const canCancel = service.canCancelOrder(order);

      // Assert
      expect(canCancel).toBe(false);
    });
  });

  describe('canModifyOrder', () => {
    it('should return true for PENDING orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PENDING });

      // Act
      const canModify = service.canModifyOrder(order);

      // Assert
      expect(canModify).toBe(true);
    });

    it('should return false for CONFIRMED orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.CONFIRMED });

      // Act
      const canModify = service.canModifyOrder(order);

      // Assert
      expect(canModify).toBe(false);
    });
  });

  describe('orderNeedsAttention', () => {
    it('should return true for PAYMENT_FAILED orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PAYMENT_FAILED });

      // Act
      const needsAttention = service.orderNeedsAttention(order);

      // Assert
      expect(needsAttention).toBe(true);
    });

    it('should return true for CANCELLED orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.CANCELLED });

      // Act
      const needsAttention = service.orderNeedsAttention(order);

      // Assert
      expect(needsAttention).toBe(true);
    });

    it('should return false for PENDING orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PENDING });

      // Act
      const needsAttention = service.orderNeedsAttention(order);

      // Assert
      expect(needsAttention).toBe(false);
    });
  });

  describe('calculateEstimatedDeliveryDate', () => {
    it('should add 2 days for São Paulo', () => {
      // Arrange
      const shippingAddress = { state: 'SP' };
      const today = new Date();

      // Act
      const deliveryDate = service.calculateEstimatedDeliveryDate(shippingAddress);

      // Assert
      const expectedDate = new Date();
      expectedDate.setDate(today.getDate() + 2);
      expect(deliveryDate.toDateString()).toBe(expectedDate.toDateString());
    });

    it('should add 5 days for nearby states', () => {
      // Arrange
      const shippingAddress = { state: 'RJ' };
      const today = new Date();

      // Act
      const deliveryDate = service.calculateEstimatedDeliveryDate(shippingAddress);

      // Assert
      const expectedDate = new Date();
      expectedDate.setDate(today.getDate() + 5);
      expect(deliveryDate.toDateString()).toBe(expectedDate.toDateString());
    });

    it('should add 10 days for distant states', () => {
      // Arrange
      const shippingAddress = { state: 'AC' };
      const today = new Date();

      // Act
      const deliveryDate = service.calculateEstimatedDeliveryDate(shippingAddress);

      // Assert
      const expectedDate = new Date();
      expectedDate.setDate(today.getDate() + 10);
      expect(deliveryDate.toDateString()).toBe(expectedDate.toDateString());
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow PENDING to CONFIRMED transition', () => {
      // Act & Assert
      expect(() => 
        service.validateStatusTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)
      ).not.toThrow();
    });

    it('should allow PENDING to CANCELLED transition', () => {
      // Act & Assert
      expect(() => 
        service.validateStatusTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)
      ).not.toThrow();
    });

    it('should not allow DELIVERED to PENDING transition', () => {
      // Act & Assert
      expect(() => 
        service.validateStatusTransition(OrderStatus.DELIVERED, OrderStatus.PENDING)
      ).toThrow('Invalid status transition from delivered to pending');
    });

    it('should not allow invalid transitions', () => {
      // Act & Assert
      expect(() => 
        service.validateStatusTransition(OrderStatus.SHIPPED, OrderStatus.PENDING)
      ).toThrow('Invalid status transition from shipped to pending');
    });
  });

  describe('createOrderItemsFromCartItems', () => {
    it('should create order items from valid cart items', () => {
      // Arrange
      const cartItems = [
        {
          productId: 'prod-1',
          productName: 'Product 1',
          productSku: 'SKU001',
          unitPrice: 50,
          quantity: 2,
          productAttributes: { color: 'red' },
        },
        {
          productId: 'prod-2',
          productName: 'Product 2',
          unitPrice: 30,
          quantity: 1,
        },
      ];

      // Act
      const orderItems = service.createOrderItemsFromCartItems(cartItems);

      // Assert
      expect(orderItems).toHaveLength(2);
      expect(orderItems[0].productId).toBe('prod-1');
      expect(orderItems[0].productName).toBe('Product 1');
      expect(orderItems[0].unitPrice).toBe(50);
      expect(orderItems[0].quantity).toBe(2);
      expect(orderItems[1].productSku).toBe('');
    });

    it('should throw error for invalid cart items', () => {
      // Arrange
      const cartItems = [
        {
          productId: 'prod-1',
          productName: 'Product 1',
          unitPrice: 0, // Invalid price
          quantity: 2,
        },
      ];

      // Act & Assert
      expect(() => service.createOrderItemsFromCartItems(cartItems)).toThrow(
        'Invalid price for product prod-1'
      );
    });
  });

  describe('applyPaymentResultToOrder', () => {
    it('should set status to PAID for successful payment', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PENDING_PAYMENT });
      const paymentResult = { status: 'success', transactionId: 'txn_123' };

      // Act
      service.applyPaymentResultToOrder(order, paymentResult);

      // Assert
      expect(order.status).toBe(OrderStatus.PAID);
      expect(order.paymentTransactionId).toBe('txn_123');
    });

    it('should set status to PAYMENT_FAILED for failed payment', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PENDING_PAYMENT });
      const paymentResult = { status: 'failed', transactionId: 'txn_456' };

      // Act
      service.applyPaymentResultToOrder(order, paymentResult);

      // Assert
      expect(order.status).toBe(OrderStatus.PAYMENT_FAILED);
      expect(order.paymentTransactionId).toBe('txn_456');
    });

    it('should set status to PENDING_PAYMENT for pending payment', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({ status: OrderStatus.PENDING });
      const paymentResult = { status: 'pending', transactionId: 'txn_789' };

      // Act
      service.applyPaymentResultToOrder(order, paymentResult);

      // Assert
      expect(order.status).toBe(OrderStatus.PENDING_PAYMENT);
      expect(order.paymentTransactionId).toBe('txn_789');
    });
  });

  describe('formatOrderSummary', () => {
    it('should format order summary correctly', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({
        orderNumber: 'ORD123456789',
        status: OrderStatus.PAID,
        totalAmount: 150.75,
      });

      // Act
      const summary = service.formatOrderSummary(order);

      // Assert
      expect(summary).toBe('ORD123456789 - paid - R$ 150.75');
    });
  });

  describe('isEligibleForRefund', () => {
    it('should return true for delivered orders within 30 days', () => {
      // Arrange
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      
      const order = deliveredOrderFactory({
        status: OrderStatus.DELIVERED,
        createdAt: fifteenDaysAgo,
      });

      // Act
      const isEligible = service.isEligibleForRefund(order);

      // Assert
      expect(isEligible).toBe(true);
    });

    it('should return false for delivered orders older than 30 days', () => {
      // Arrange
      const fortyDaysAgo = new Date();
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);
      
      const order = deliveredOrderFactory({
        status: OrderStatus.DELIVERED,
        createdAt: fortyDaysAgo,
      });

      // Act
      const isEligible = service.isEligibleForRefund(order);

      // Assert
      expect(isEligible).toBe(false);
    });

    it('should return false for non-delivered orders', () => {
      // Arrange
      const order = orderPurchaseOrderFactory.build({
        status: OrderStatus.SHIPPED,
        createdAt: new Date(),
      });

      // Act
      const isEligible = service.isEligibleForRefund(order);

      // Assert
      expect(isEligible).toBe(false);
    });
  });
});