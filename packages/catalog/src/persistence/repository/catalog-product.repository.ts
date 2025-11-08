import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { CatalogProduct } from '../entity/catalog-product.entity';
import { ProductCategory } from '../../core/enum/product-category.enum';
import { ProductStatus } from '../../core/enum/product-status.enum';

@Injectable()
export class CatalogProductRepository extends DefaultTypeOrmRepository<CatalogProduct> {
  constructor(
    @InjectDataSource('catalog')
    dataSource: DataSource
  ) {
    super(CatalogProduct, dataSource.manager);
  }

  async findByCategory(category: ProductCategory): Promise<CatalogProduct[]> {
    return this.find({
      where: { category, status: ProductStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: ProductStatus): Promise<CatalogProduct[]> {
    return this.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  async findBySku(sku: string): Promise<CatalogProduct | null> {
    return this.findOne({
      where: { sku },
    });
  }

  async searchByName(searchTerm: string): Promise<CatalogProduct[]> {
    return this.find({
      where: {
        name: searchTerm,
        status: ProductStatus.ACTIVE,
      },
    });
  }

  async findActiveProducts(): Promise<CatalogProduct[]> {
    return this.findByStatus(ProductStatus.ACTIVE);
  }

  async updateStock(productId: string, newStock: number): Promise<void> {
    await this.update(productId, { stock: newStock });
  }
}