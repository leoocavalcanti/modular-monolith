import { CatalogProduct } from '../../persistence/entity/catalog-product.entity';
import { ProductCategory } from '../enum/product-category.enum';
import { ProductStatus } from '../enum/product-status.enum';

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  category: ProductCategory;
  imageUrls?: string[];
  attributes?: Record<string, any>;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  imageUrls?: string[];
  attributes?: Record<string, any>;
}

export interface ICatalogProductService {
  createProduct(data: CreateProductData): Promise<CatalogProduct>;
  updateProduct(id: string, data: UpdateProductData): Promise<CatalogProduct>;
  getProductById(id: string): Promise<CatalogProduct>;
  getProductBySku(sku: string): Promise<CatalogProduct>;
  getProductsByCategory(category: ProductCategory): Promise<CatalogProduct[]>;
  getProductsByStatus(status: ProductStatus): Promise<CatalogProduct[]>;
  getAllProducts(): Promise<CatalogProduct[]>;
  updateStock(id: string, quantity: number): Promise<CatalogProduct>;
  updateStatus(id: string, status: ProductStatus): Promise<CatalogProduct>;
  deleteProduct(id: string): Promise<void>;
}