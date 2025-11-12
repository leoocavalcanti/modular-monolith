import { IsString, IsNumber, IsOptional, IsObject, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsString({ message: 'Product ID must be a valid string' })
  productId: string;

  @IsString({ message: 'Product name must be a valid string' })
  productName: string;

  @IsString({ message: 'Product SKU must be a valid string' })
  productSku: string;

  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsPositive({ message: 'Price must be greater than zero' })
  price: number;

  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @IsOptional()
  @IsObject({ message: 'Product attributes must be a valid object' })
  productAttributes?: Record<string, unknown>;
}