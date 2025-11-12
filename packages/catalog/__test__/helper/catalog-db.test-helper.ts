import { Knex } from 'knex';

export enum CatalogTables {
  CatalogProduct = 'CatalogProduct',
}

export async function cleanUpCatalogDatabase(testDbClient: Knex): Promise<void> {
  // Clean in reverse dependency order
  await testDbClient(CatalogTables.CatalogProduct).del();
}

export async function insertCatalogProduct(testDbClient: Knex, product: any): Promise<void> {
  await testDbClient(CatalogTables.CatalogProduct).insert({
    ...product,
    imageUrls: JSON.stringify(product.imageUrls),
    attributes: JSON.stringify(product.attributes),
  });
}