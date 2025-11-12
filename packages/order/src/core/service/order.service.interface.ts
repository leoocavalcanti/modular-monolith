import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';
import { OrderStatus } from '../enum/order-status.enum';

export interface CreateOrderFromCartData {
  cartId: string;
  userId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethodId: string;
}

export interface IOrderService {
  createOrderFromCart(data: CreateOrderFromCartData): Promise<OrderPurchaseOrder>;
  getOrderById(orderId: string): Promise<OrderPurchaseOrder>;
  getOrderByNumber(orderNumber: string): Promise<OrderPurchaseOrder>;
  getUserOrders(userId: string): Promise<OrderPurchaseOrder[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderPurchaseOrder>;
  cancelOrder(orderId: string): Promise<OrderPurchaseOrder>;
  confirmPayment(orderId: string): Promise<OrderPurchaseOrder>;
}