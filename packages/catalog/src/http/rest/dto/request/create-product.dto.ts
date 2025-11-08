import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsObject, IsPositive, Min } from 'class-validator';
import { ProductCategory } from '../../../../core/enum/product-category.enum';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  sku: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}