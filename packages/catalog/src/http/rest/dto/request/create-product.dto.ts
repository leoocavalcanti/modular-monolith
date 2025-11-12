import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsObject, IsPositive, Min } from 'class-validator';
import { ProductCategory } from '../../../../core/enum/product-category.enum';

export class CreateProductDto {
  @IsString({ message: 'Product name must be a valid string' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Product description must be a valid string' })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid number with up to 2 decimal places' })
  @IsPositive({ message: 'Price must be greater than zero' })
  price: number;

  @IsNumber({}, { message: 'Stock must be a valid number' })
  @Min(0, { message: 'Stock must be greater than or equal to zero' })
  stock: number;

  @IsString({ message: 'SKU must be a valid string' })
  sku: string;

  @IsEnum(ProductCategory, { message: 'Category must be a valid product category' })
  category: ProductCategory;

  @IsOptional()
  @IsArray({ message: 'Image URLs must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a valid string' })
  imageUrls?: string[];

  @IsOptional()
  @IsObject({ message: 'Attributes must be a valid object' })
  attributes?: Record<string, any>;
}