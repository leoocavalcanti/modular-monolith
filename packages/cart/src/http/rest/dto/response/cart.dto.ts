import { Expose, Type } from 'class-transformer';
import { CartStatus } from '../../../../core/enum/cart-status.enum';

export class CartItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  productSku: string;

  @Expose()
  price: number;

  @Expose()
  quantity: number;

  @Expose()
  productAttributes: Record<string, unknown>;

  @Expose()
  createdAt: Date;
}

export class CartResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  status: CartStatus;

  @Expose()
  totalAmount: number;

  @Expose()
  @Type(() => CartItemResponseDto)
  items: CartItemResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}