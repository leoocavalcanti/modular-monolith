import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsObject, IsPositive, Min } from 'class-validator';
import { ProductCategory } from '../../../../core/enum/product-category.enum';
import { ProductStatus } from '../../../../core/enum/product-status.enum';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}