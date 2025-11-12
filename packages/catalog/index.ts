export { CatalogModule } from './catalog.module';

// Export public facades
export { CatalogFacade } from './src/public-api/facade/catalog.facade';

// Export public enums
export { ProductStatus } from './src/core/enum/product-status.enum';
export { ProductCategory } from './src/core/enum/product-category.enum';

// Export public interfaces
export type { ICatalogPublicApi, ProductAvailability, ProductInfo } from './src/public-api/interface/catalog-public.interface';