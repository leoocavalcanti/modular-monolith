import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { OrderPurchaseOrderItem } from '../entity/order-purchase-order-item.entity';

@Injectable()
export class OrderPurchaseOrderItemRepository extends DefaultTypeOrmRepository<OrderPurchaseOrderItem> {
  constructor(
    @InjectDataSource('order')
    dataSource: DataSource
  ) {
    super(OrderPurchaseOrderItem, dataSource.manager);
  }

  async findByOrderId(orderId: string): Promise<OrderPurchaseOrderItem[]> {
    return this.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByProductId(productId: string): Promise<OrderPurchaseOrderItem[]> {
    return this.find({
      where: { productId },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrderAndProduct(orderId: string, productId: string): Promise<OrderPurchaseOrderItem | null> {
    return this.findOne({
      where: { orderId, productId },
    });
  }

  async removeByOrderId(orderId: string): Promise<void> {
    const items = await this.findByOrderId(orderId);
    if (items.length > 0) {
      await this.remove(items);
    }
  }

  async getTotalValueByOrderId(orderId: string): Promise<number> {
    const items = await this.findByOrderId(orderId);
    return items.reduce((total, item) => total + item.totalPrice, 0);
  }

  async getItemCountByOrderId(orderId: string): Promise<number> {
    const items = await this.findByOrderId(orderId);
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}