import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { PaymentTransaction } from '../../src/persistence/entity/payment-transaction.entity';
import { PaymentMethod } from '../../src/core/enum/payment-method.enum';
import { PaymentStatus } from '../../src/core/enum/payment-status.enum';

export const paymentTransactionFactory = Factory.Sync.makeFactory<PaymentTransaction>({
  id: Factory.each(() => faker.string.uuid()),
  orderId: Factory.each(() => faker.string.uuid()),
  amount: Factory.each(() => parseFloat(faker.commerce.price())),
  currency: 'BRL',
  paymentMethod: PaymentMethod.CREDIT_CARD,
  status: PaymentStatus.PENDING,
  transactionId: Factory.each(() => `txn_${faker.string.alphanumeric(10)}`),
  gatewayReference: Factory.each(() => faker.string.alphanumeric(12)),
  customerEmail: Factory.each(() => faker.internet.email()),
  cardDetails: Factory.each(() => ({
    lastFourDigits: faker.string.numeric(4),
    cardholderName: faker.person.fullName(),
    cardBrand: faker.helpers.arrayElement(['VISA', 'MASTERCARD', 'AMEX']),
  })),
  pixDetails: Factory.each(() => ({})),
  boletoDetails: Factory.each(() => ({})),
  errorCode: Factory.each(() => ''),
  errorMessage: Factory.each(() => ''),
  metadata: Factory.each(() => ({})),
  processedAt: Factory.each(() => faker.date.recent()),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  beforeInsert: () => {},
  beforeUpdate: () => {},
  isSuccess: () => false,
  isFailed: () => false,
  isPending: () => true,
});

export const paymentTransactionSuccessFactory = (overrides: Partial<PaymentTransaction> = {}) => {
  return paymentTransactionFactory.build({
    ...overrides,
    status: PaymentStatus.SUCCESS,
    transactionId: `txn_${faker.string.alphanumeric(10)}`,
    processedAt: faker.date.recent(),
  });
};

export const paymentTransactionFailedFactory = (overrides: Partial<PaymentTransaction> = {}) => {
  return paymentTransactionFactory.build({
    ...overrides,
    status: PaymentStatus.FAILED,
    errorCode: 'INSUFFICIENT_FUNDS',
    errorMessage: 'Insufficient funds',
    processedAt: faker.date.recent(),
  });
};

export const pixPaymentFactory = (overrides: Partial<PaymentTransaction> = {}) => {
  return paymentTransactionFactory.build({
    ...overrides,
    paymentMethod: PaymentMethod.PIX,
    cardDetails: undefined,
    pixDetails: {
      pixKey: faker.string.uuid(),
      qrCode: faker.string.alphanumeric(200),
      expiresAt: faker.date.future(),
    },
  });
};

export const boletoPaymentFactory = (overrides: Partial<PaymentTransaction> = {}) => {
  return paymentTransactionFactory.build({
    ...overrides,
    paymentMethod: PaymentMethod.BOLETO,
    cardDetails: undefined,
    boletoDetails: {
      barcode: faker.string.numeric(44),
      digitalLine: faker.string.numeric(47),
      expiresAt: faker.date.future(),
    },
  });
};