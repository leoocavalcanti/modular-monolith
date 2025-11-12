import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { CartShoppingCart } from '../../src/persistence/entity/cart-shopping-cart.entity';
import { CartShoppingCartItem } from '../../src/persistence/entity/cart-shopping-cart-item.entity';
import { CartStatus } from '../../src/core/enum/cart-status.enum';

export const cartShoppingCartFactory = Factory.Sync.makeFactory<CartShoppingCart>({
  id: Factory.each(() => faker.string.uuid()),
  userId: Factory.each(() => faker.string.uuid()),
  status: CartStatus.ACTIVE,
  totalAmount: Factory.each(() => parseFloat(faker.commerce.price())),
  items: [],
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  beforeInsert: () => {},
  beforeUpdate: () => {},
  calculateTotal: () => 0,
  getTotalItems: () => 0,
});

export const cartShoppingCartItemFactory = Factory.Sync.makeFactory<CartShoppingCartItem>({
  id: Factory.each(() => faker.string.uuid()),
  cartId: Factory.each(() => faker.string.uuid()),
  productId: Factory.each(() => faker.string.uuid()),
  productName: Factory.each(() => faker.commerce.productName()),
  productSku: Factory.each(() => faker.string.alphanumeric(8).toUpperCase()),
  price: Factory.each(() => parseFloat(faker.commerce.price())),
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
  cart: undefined as any,
  getSubtotal: () => 0,
  get totalPrice() { return 0; },
});

export const cartShoppingCartWithItemsFactory = (overrides: Partial<CartShoppingCart> = {}) => {
  const cart = cartShoppingCartFactory.build(overrides);
  const items = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
    cartShoppingCartItemFactory.build({ cartId: cart.id })
  );
  
  return { ...cart, items };
};

export const emptyCartFactory = (overrides: Partial<CartShoppingCart> = {}) => {
  return cartShoppingCartFactory.build({
    ...overrides,
    items: [],
  });
};