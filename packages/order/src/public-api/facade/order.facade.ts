import { Injectable } from '@nestjs/common';
import { OrderService } from '../../core/service/order.service';
import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';
import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';
import { IOrderPublicApi, OrderStatusResponse, OrderSummary } from '../interface/order-public.interface';

export interface OrderManagementApi {
  getOrderById(orderId: string): Promise<OrderPurchaseOrder>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderPurchaseOrder>;
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<OrderPurchaseOrder>;
}

@Injectable()
export class OrderFacade implements OrderManagementApi, IOrderPublicApi {
  constructor(private readonly orderService: OrderService) {}

  async getOrderById(orderId: string): Promise<OrderPurchaseOrder> {
    const order = await this.orderService.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderPurchaseOrder> {
    return this.orderService.updateOrderStatus(orderId, status);
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<OrderPurchaseOrder> {
    return this.orderService.updatePaymentStatus(orderId, paymentStatus);
  }

  // IOrderPublicApi implementation
  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    const order = await this.getOrderById(orderId);
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async getOrderSummary(orderId: string): Promise<OrderSummary> {
    const order = await this.getOrderById(orderId);
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      itemCount: order.items?.length || 0,
      status: order.status,
    };
  }

  async createOrderFromCart(_cartId: string, _userId: string): Promise<string> {
    // This would call a use case for order creation
    throw new Error('Method not implemented yet');
  }

  async confirmPayment(orderId: string): Promise<void> {
    await this.updatePaymentStatus(orderId, PaymentStatus.SUCCESS);
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }
}