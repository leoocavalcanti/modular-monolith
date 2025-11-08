import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { CatalogProductRepository } from '../../persistence/repository/catalog-product.repository';

export interface UpdateProductStockRequest {
  productId: string;
  quantityChange: number; // positive for increase, negative for decrease
  reason: 'purchase' | 'restock' | 'adjustment' | 'return' | 'damage';
  notes?: string;
  updatedBy: string;
}

export interface UpdateProductStockResult {
  productId: string;
  previousStock: number;
  newStock: number;
  quantityChange: number;
  reason: string;
  updatedAt: Date;
}

@Injectable()
export class UpdateProductStockUseCase {
  constructor(
    private readonly productRepository: CatalogProductRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(request: UpdateProductStockRequest): Promise<UpdateProductStockResult> {
    this.logger.log(`Updating product stock`, {
      productId: request.productId,
      quantityChange: request.quantityChange,
      reason: request.reason,
      updatedBy: request.updatedBy,
    });

    return await runInTransaction(
      async () => {
        const product = await this.productRepository.findOneById(request.productId);
        
        if (!product) {
          throw new Error(`Product ${request.productId} not found`);
        }

        const previousStock = product.stock;
        const newStock = previousStock + request.quantityChange;

        // Validate that stock doesn't go negative
        if (newStock < 0) {
          throw new Error(
            `Insufficient stock. Current: ${previousStock}, Requested change: ${request.quantityChange}. ` +
            `This would result in negative stock: ${newStock}`
          );
        }

        // Update product stock
        product.stock = newStock;
        product.updatedAt = new Date();

        await this.productRepository.save(product);

        // Log stock change for audit trail
        this.logger.log(`Product stock updated successfully`, {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          previousStock,
          newStock,
          quantityChange: request.quantityChange,
          reason: request.reason,
          notes: request.notes,
          updatedBy: request.updatedBy,
        });

        return {
          productId: product.id,
          previousStock,
          newStock,
          quantityChange: request.quantityChange,
          reason: request.reason,
          updatedAt: product.updatedAt,
        };
      },
      {
        connectionName: 'catalog',
      }
    );
  }
}