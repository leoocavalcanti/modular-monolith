import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';

export interface OrderStatusResponse {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
  status: OrderStatus;
}

export interface IOrderPublicApi {
  getOrderStatus(orderId: string): Promise<OrderStatusResponse>;
  getOrderSummary(orderId: string): Promise<OrderSummary>;
  createOrderFromCart(cartId: string, userId: string): Promise<string>;
  confirmPayment(orderId: string): Promise<void>;
  cancelOrder(orderId: string): Promise<void>;
}