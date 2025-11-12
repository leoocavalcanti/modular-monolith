import { DefaultEntity } from '@tlc/shared-module/typeorm';
import { Column, Entity, TableInheritance, ChildEntity } from 'typeorm';
import { ProductCategory } from '../../core/enum/product-category.enum';
import { ProductStatus } from '../../core/enum/product-status.enum';

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
}

@Entity({ name: 'Product' })
@TableInheritance({ column: { type: 'enum', name: 'type', enum: ProductType } })
export abstract class ProductBase extends DefaultEntity<ProductBase> {
  @Column({ nullable: false, type: 'enum', enum: ProductType })
  type: ProductType;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  sku: string;

  @Column({ type: 'enum', enum: ProductCategory, nullable: false })
  category: ProductCategory;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.AVAILABLE })
  status: ProductStatus;

  @Column({ type: 'json', nullable: true })
  imageUrls: string[];

  @Column({ type: 'json', nullable: true })
  attributes: Record<string, any>;
}

@ChildEntity(ProductType.PHYSICAL)
export class PhysicalProduct extends ProductBase {
  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'json', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  @Column({ type: 'boolean', default: true })
  requiresShipping: boolean;

  static create(data: {
    name: string;
    description?: string;
    price: number;
    sku: string;
    category: ProductCategory;
    stock?: number;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    imageUrls?: string[];
    attributes?: Record<string, any>;
  }): PhysicalProduct {
    return new PhysicalProduct({
      ...data,
      type: ProductType.PHYSICAL,
      stock: data.stock || 0,
    } as Partial<PhysicalProduct>);
  }
}

@ChildEntity(ProductType.DIGITAL)
export class DigitalProduct extends ProductBase {
  @Column({ type: 'varchar', nullable: true })
  downloadUrl: string;

  @Column({ type: 'varchar', nullable: true })
  licenseKey: string;

  @Column({ type: 'int', nullable: true })
  downloadLimit: number;

  @Column({ type: 'boolean', default: false })
  requiresActivation: boolean;

  static create(data: {
    name: string;
    description?: string;
    price: number;
    sku: string;
    category: ProductCategory;
    downloadUrl?: string;
    licenseKey?: string;
    downloadLimit?: number;
    imageUrls?: string[];
    attributes?: Record<string, any>;
  }): DigitalProduct {
    return new DigitalProduct({
      ...data,
      type: ProductType.DIGITAL,
    } as Partial<DigitalProduct>);
  }
}

@ChildEntity(ProductType.SERVICE)
export class ServiceProduct extends ProductBase {
  @Column({ type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ type: 'boolean', default: false })
  requiresAppointment: boolean;

  @Column({ type: 'json', nullable: true })
  availability: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
  };

  static create(data: {
    name: string;
    description?: string;
    price: number;
    sku: string;
    category: ProductCategory;
    durationMinutes?: number;
    requiresAppointment?: boolean;
    availability?: { startTime: string; endTime: string; daysOfWeek: number[] };
    imageUrls?: string[];
    attributes?: Record<string, any>;
  }): ServiceProduct {
    return new ServiceProduct({
      ...data,
      type: ProductType.SERVICE,
    } as Partial<ServiceProduct>);
  }
}