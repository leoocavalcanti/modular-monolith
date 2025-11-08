import { Expose } from 'class-transformer';
import { ProductCategory } from '../../../../core/enum/product-category.enum';
import { ProductStatus } from '../../../../core/enum/product-status.enum';

export class ProductResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  stock: number;

  @Expose()
  sku: string;

  @Expose()
  category: ProductCategory;

  @Expose()
  status: ProductStatus;

  @Expose()
  imageUrls: string[];

  @Expose()
  attributes: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}