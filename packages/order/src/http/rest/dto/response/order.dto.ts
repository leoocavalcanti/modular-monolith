import { Expose, Type } from 'class-transformer';
import { OrderStatus } from '../../../../core/enum/order-status.enum';
import { PaymentStatus } from '../../../../core/enum/payment-status.enum';

export class OrderItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  productId: string;

  @Expose()
  productName: string;

  @Expose()
  productSku: string;

  @Expose()
  unitPrice: number;

  @Expose()
  quantity: number;

  @Expose()
  productAttributes: Record<string, any>;

  @Expose()
  createdAt: Date;
}

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderNumber: string;

  @Expose()
  userId: string;

  @Expose()
  cartId: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  paymentStatus: PaymentStatus;

  @Expose()
  paymentId: string;

  @Expose()
  totalAmount: number;

  @Expose()
  taxAmount: number;

  @Expose()
  shippingAmount: number;

  @Expose()
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Expose()
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Expose()
  @Type(() => OrderItemResponseDto)
  items: OrderItemResponseDto[];

  @Expose()
  metadata: Record<string, any>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}