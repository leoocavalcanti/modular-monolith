import { ProductStatus } from '../../core/enum/product-status.enum';
import { ProductCategory } from '../../core/enum/product-category.enum';

export interface ProductAvailability {
  productId: string;
  sku: string;
  available: boolean;
  stock: number;
  price: number;
}

export interface ProductInfo {
  productId: string;
  name: string;
  sku: string;
  price: number;
  category: ProductCategory;
  status: ProductStatus;
  imageUrls: string[];
}

export interface ICatalogPublicApi {
  getProductAvailability(productId: string): Promise<ProductAvailability>;
  getProductInfo(productId: string): Promise<ProductInfo>;
  validateProductExists(productId: string): Promise<boolean>;
  reserveStock(productId: string, quantity: number): Promise<boolean>;
  releaseStock(productId: string, quantity: number): Promise<void>;
  getProductsByIds(productIds: string[]): Promise<ProductInfo[]>;
}