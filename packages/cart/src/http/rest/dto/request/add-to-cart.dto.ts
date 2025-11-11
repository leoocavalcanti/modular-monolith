import { IsString, IsNumber, IsOptional, IsObject, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  productSku: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsObject()
  productAttributes?: Record<string, unknown>;
}