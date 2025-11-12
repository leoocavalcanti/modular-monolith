import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { OrderPurchaseOrder } from '../../src/persistence/entity/order-purchase-order.entity';
import { OrderPurchaseOrderItem } from '../../src/persistence/entity/order-purchase-order-item.entity';
import { OrderStatus } from '../../src/core/enum/order-status.enum';
import { PaymentStatus } from '../../src/core/enum/payment-status.enum';

export const orderPurchaseOrderFactory = Factory.Sync.makeFactory<OrderPurchaseOrder>({
  id: Factory.each(() => faker.string.uuid()),
  orderNumber: Factory.each(() => `ORD${Date.now()}${faker.number.int({ min: 100, max: 999 })}`),
  userId: Factory.each(() => faker.string.uuid()),
  cartId: Factory.each(() => faker.string.uuid()),
  status: OrderStatus.PENDING,
  paymentStatus: PaymentStatus.PENDING,
  paymentId: Factory.each(() => faker.string.uuid()),
  paymentTransactionId: Factory.each(() => `txn_${faker.string.alphanumeric(10)}`),
  trackingNumber: Factory.each(() => faker.string.alphanumeric(12).toUpperCase()),
  customerEmail: Factory.each(() => faker.internet.email()),
  notes: Factory.each(() => faker.lorem.sentence()),
  estimatedDeliveryDate: Factory.each(() => faker.date.future()),
  totalAmount: Factory.each(() => parseFloat(faker.commerce.price({ min: 50, max: 500 }))),
  taxAmount: Factory.each(() => parseFloat(faker.commerce.price({ min: 0, max: 50 }))),
  shippingAmount: Factory.each(() => parseFloat(faker.commerce.price({ min: 0, max: 50 }))),
  shippingAddress: Factory.each(() => ({
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode(),
    country: 'BR',
  })),
  billingAddress: Factory.each(() => ({
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zipCode: faker.location.zipCode(),
    country: 'BR',
  })),
  items: [],
  metadata: Factory.each(() => ({
    source: 'web',
    promotionCode: faker.string.alphanumeric(8),
  })),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  beforeInsert: () => {},
  beforeUpdate: () => {},
  calculateSubtotal: () => 0,
  calculateTotal: () => 0,
});

export const orderPurchaseOrderItemFactory = Factory.Sync.makeFactory<OrderPurchaseOrderItem>({
  id: Factory.each(() => faker.string.uuid()),
  orderId: Factory.each(() => faker.string.uuid()),
  productId: Factory.each(() => faker.string.uuid()),
  productName: Factory.each(() => faker.commerce.productName()),
  productSku: Factory.each(() => faker.string.alphanumeric(8).toUpperCase()),
  unitPrice: Factory.each(() => parseFloat(faker.commerce.price())),
  quantity: Factory.each(() => faker.number.int({ min: 1, max: 5 })),
  productAttributes: Factory.each(() => ({
    color: faker.color.human(),
    size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
  })),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  beforeInsert: () => {},
  beforeUpdate: () => {},
  order: undefined as any,
  getSubtotal: () => 0,
  get totalPrice() { return 0; },
  get price() { return 0; },
});

export const orderWithItemsFactory = (overrides: Partial<OrderPurchaseOrder> = {}) => {
  const order = orderPurchaseOrderFactory.build(overrides);
  const items = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
    orderPurchaseOrderItemFactory.build({ orderId: order.id })
  );
  
  return { ...order, items };
};

export const paidOrderFactory = (overrides: Partial<OrderPurchaseOrder> = {}) => {
  return orderPurchaseOrderFactory.build({
    ...overrides,
    status: OrderStatus.PAID,
    paymentStatus: PaymentStatus.SUCCESS,
  });
};

export const deliveredOrderFactory = (overrides: Partial<OrderPurchaseOrder> = {}) => {
  return orderPurchaseOrderFactory.build({
    ...overrides,
    status: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.SUCCESS,
    trackingNumber: `TRK${faker.string.alphanumeric(10)}`,
  });
};

export const cancelledOrderFactory = (overrides: Partial<OrderPurchaseOrder> = {}) => {
  return orderPurchaseOrderFactory.build({
    ...overrides,
    status: OrderStatus.CANCELLED,
    paymentStatus: PaymentStatus.FAILED,
  });
};