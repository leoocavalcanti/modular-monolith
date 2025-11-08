import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { OrderPurchaseOrder } from '../entity/order-purchase-order.entity';
import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';

@Injectable()
export class OrderPurchaseOrderRepository extends DefaultTypeOrmRepository<OrderPurchaseOrder> {
  constructor(
    @InjectDataSource('order')
    dataSource: DataSource
  ) {
    super(OrderPurchaseOrder, dataSource.manager);
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderPurchaseOrder | null> {
    return this.findOne({
      where: { orderNumber },
      relations: ['items'],
    });
  }

  async findByUserId(userId: string): Promise<OrderPurchaseOrder[]> {
    return this.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserIdAndStatus(userId: string, status: OrderStatus): Promise<OrderPurchaseOrder[]> {
    return this.find({
      where: { userId, status },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPaymentStatus(paymentStatus: PaymentStatus): Promise<OrderPurchaseOrder[]> {
    return this.find({
      where: { paymentStatus },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOrderWithItems(orderId: string): Promise<OrderPurchaseOrder | null> {
    return this.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
  }
}