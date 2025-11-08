import { IsString, IsNumber, IsOptional, IsObject, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsObject()
  productAttributes?: Record<string, any>;
}