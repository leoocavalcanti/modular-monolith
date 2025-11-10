import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { CatalogProduct } from '../../persistence/entity/catalog-product.entity';
import { CatalogProductRepository } from '../../persistence/repository/catalog-product.repository';
import { ProductCategory } from '../enum/product-category.enum';

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  imageUrl?: string;
  specifications?: Record<string, any>;
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    weight: number;
  };
  createdBy: string; // admin user ID
}

export interface CreateProductResult {
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepository: CatalogProductRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResult> {
    this.logger.log(`Creating new product`, {
      name: request.name,
      sku: request.sku,
      category: request.category,
      createdBy: request.createdBy,
    });

    return await runInTransaction(
      async () => {
        // Validate SKU uniqueness
        const existingProduct = await this.productRepository.findBySku(request.sku);
        if (existingProduct) {
          throw new Error(`Product with SKU ${request.sku} already exists`);
        }

        // Validate price
        if (request.price <= 0) {
          throw new Error('Product price must be greater than 0');
        }

        // Validate stock
        if (request.stock < 0) {
          throw new Error('Product stock cannot be negative');
        }

        // Create product
        const product = new CatalogProduct({
          name: request.name,
          description: request.description,
          price: request.price,
          stock: request.stock,
          sku: request.sku,
          category: request.category as ProductCategory,
          imageUrls: request.imageUrl ? [request.imageUrl] : [],
          attributes: {
            specifications: request.specifications,
            dimensions: request.dimensions,
            isActive: true,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const savedProduct = await this.productRepository.save(product);

        this.logger.log(`Product created successfully`, {
          productId: savedProduct.id,
          name: savedProduct.name,
          sku: savedProduct.sku,
          price: savedProduct.price,
          category: savedProduct.category,
        });

        return {
          productId: savedProduct.id,
          name: savedProduct.name,
          sku: savedProduct.sku,
          price: savedProduct.price,
          stock: savedProduct.stock,
          category: savedProduct.category,
          createdAt: savedProduct.createdAt,
        };
      },
      {
        connectionName: 'catalog',
      }
    );
  }
}