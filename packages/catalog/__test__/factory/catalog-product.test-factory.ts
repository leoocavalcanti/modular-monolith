import { faker } from '@faker-js/faker';
import * as Factory from 'factory.ts';
import { CatalogProduct } from '../../src/persistence/entity/catalog-product.entity';
import { ProductCategory } from '../../src/core/enum/product-category.enum';
import { ProductStatus } from '../../src/core/enum/product-status.enum';

export const catalogProductFactory = Factory.Sync.makeFactory<CatalogProduct>({
  id: Factory.each(() => faker.string.uuid()),
  name: Factory.each(() => faker.commerce.productName()),
  description: Factory.each(() => faker.commerce.productDescription()),
  price: Factory.each(() => parseFloat(faker.commerce.price())),
  stock: Factory.each(() => faker.number.int({ min: 0, max: 100 })),
  sku: Factory.each(() => faker.string.alphanumeric(8).toUpperCase()),
  category: ProductCategory.ELECTRONICS,
  status: ProductStatus.ACTIVE,
  imageUrls: Factory.each(() => [faker.image.url()]),
  attributes: Factory.each(() => ({
    brand: faker.company.name(),
    color: faker.color.human(),
    weight: `${faker.number.int({ min: 1, max: 10 })}kg`,
  })),
  createdAt: Factory.each(() => faker.date.recent()),
  updatedAt: Factory.each(() => faker.date.recent()),
  deletedAt: null,
  beforeInsert: () => {},
  beforeUpdate: () => {},
});

export const catalogProductOutOfStockFactory = (overrides: Partial<CatalogProduct> = {}) => {
  return catalogProductFactory.build({
    ...overrides,
    stock: 0,
    status: ProductStatus.OUT_OF_STOCK,
  });
};

export const catalogProductInactiveFactory = (overrides: Partial<CatalogProduct> = {}) => {
  return catalogProductFactory.build({
    ...overrides,
    status: ProductStatus.INACTIVE,
  });
};

export const catalogProductWithCategoryFactory = (
  category: ProductCategory,
  overrides: Partial<CatalogProduct> = {}
) => {
  return catalogProductFactory.build({
    ...overrides,
    category,
  });
};