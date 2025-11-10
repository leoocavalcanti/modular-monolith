import { Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CatalogProductRepository } from '../../persistence/repository/catalog-product.repository';
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
  status?: ProductStatus;
  imageUrls?: string[];
  attributes?: Record<string, any>;
}

@Injectable()
export class CatalogProductService {
  constructor(
    private readonly catalogProductRepository: CatalogProductRepository
  ) {}

  async getAllProducts(): Promise<CatalogProduct[]> {
    return this.catalogProductRepository.findActiveProducts();
  }

  async getProductById(productId: string): Promise<CatalogProduct> {
    const product = await this.catalogProductRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return product;
  }

  async getProductsByCategory(category: ProductCategory): Promise<CatalogProduct[]> {
    return this.catalogProductRepository.findByCategory(category);
  }

  async searchProducts(searchTerm: string): Promise<CatalogProduct[]> {
    return this.catalogProductRepository.searchByName(searchTerm);
  }

  @Transactional({ connectionName: 'catalog' })
  async createProduct(data: CreateProductData): Promise<CatalogProduct> {
    const existingProduct = await this.catalogProductRepository.findBySku(data.sku);
    if (existingProduct) {
      throw new Error(`Product with SKU ${data.sku} already exists`);
    }

    const product = new CatalogProduct({
      name: data.name,
      description: data.description || '',
      price: data.price,
      stock: data.stock,
      sku: data.sku,
      category: data.category,
      imageUrls: data.imageUrls || [],
      attributes: data.attributes || {},
      status: ProductStatus.DRAFT,
    });

    return this.catalogProductRepository.save(product);
  }

  @Transactional({ connectionName: 'catalog' })
  async updateProduct(productId: string, data: UpdateProductData): Promise<CatalogProduct> {
    const product = await this.getProductById(productId);

    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = data.price;
    if (data.stock !== undefined) product.stock = data.stock;
    if (data.category !== undefined) product.category = data.category;
    if (data.status !== undefined) product.status = data.status;
    if (data.imageUrls !== undefined) product.imageUrls = data.imageUrls;
    if (data.attributes !== undefined) product.attributes = data.attributes;

    return this.catalogProductRepository.save(product);
  }

  @Transactional({ connectionName: 'catalog' })
  async deleteProduct(productId: string): Promise<void> {
    const product = await this.getProductById(productId);
    if (product) {
      await this.catalogProductRepository.remove(product);
    }
  }

  @Transactional({ connectionName: 'catalog' })
  async updateStock(productId: string, newStock: number): Promise<CatalogProduct> {
    const product = await this.getProductById(productId);
    product.stock = newStock;

    if (newStock === 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (product.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
    }

    return this.catalogProductRepository.save(product);
  }

  async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getProductById(productId);
    return product.status === ProductStatus.ACTIVE && product.stock >= quantity;
  }
}