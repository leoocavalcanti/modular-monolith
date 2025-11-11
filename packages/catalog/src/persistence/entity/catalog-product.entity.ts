import { Entity, Column } from 'typeorm';
import { ProductCategory } from '../../core/enum/product-category.enum';
import { ProductStatus } from '../../core/enum/product-status.enum';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'CatalogProduct' })
export class CatalogProduct extends DefaultEntity<CatalogProduct> {
  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column()
  sku: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column('simple-array', { nullable: true })
  imageUrls: string[];

  @Column('json', { nullable: true })
  attributes: Record<string, unknown>;

  static create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
    sku: string;
    category: ProductCategory;
    status?: ProductStatus;
    imageUrls?: string[];
    attributes?: Record<string, unknown>;
  }): CatalogProduct {
    const product = new CatalogProduct({
      ...data,
      stock: data.stock || 0,
      status: data.status || ProductStatus.DRAFT,
      imageUrls: data.imageUrls || [],
      attributes: data.attributes || {},
    } as Partial<CatalogProduct>);
    return product;
  }
}