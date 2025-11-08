import { Injectable } from '@nestjs/common';
import { OrderService } from '../../core/service/order.service';
import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';
import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';

export interface OrderManagementApi {
  getOrderById(orderId: string): Promise<OrderPurchaseOrder>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderPurchaseOrder>;
  updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<OrderPurchaseOrder>;
}

@Injectable()
export class OrderFacade implements OrderManagementApi {
  constructor(private readonly orderService: OrderService) {}

  async getOrderById(orderId: string): Promise<OrderPurchaseOrder> {
    return this.orderService.getOrderById(orderId);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderPurchaseOrder> {
    return this.orderService.updateOrderStatus(orderId, status);
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<OrderPurchaseOrder> {
    return this.orderService.updatePaymentStatus(orderId, paymentStatus);
  }
}