import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { QUEUES } from '@tlc/shared-module/queue';
import { Queue } from 'bullmq';
import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';

export interface OrderFulfillmentJobData {
  orderId: string;
  userId: string;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

@Injectable()
export class OrderFulfillmentProducer {
  constructor(
    @InjectQueue(QUEUES.ORDER_FULFILLMENT) private fulfillmentQueue: Queue,
    @InjectQueue(QUEUES.EMAIL_NOTIFICATION) private notificationQueue: Queue,
    private readonly logger: AppLogger
  ) {}

  private createOrderJob(order: OrderPurchaseOrder): OrderFulfillmentJobData {
    return {
      orderId: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
    };
  }

  async fulfillOrder(order: OrderPurchaseOrder) {
    this.logger.log(
      `Queueing order fulfillment job for order ID: ${order.id}`
    );

    const job = await this.fulfillmentQueue.add(
      'fulfill',
      this.createOrderJob(order),
      {
        priority: 10,
      }
    );

    this.logger.log(
      `Order fulfillment job created with ID: ${job.id} for order ID: ${order.id}`
    );
    return job.id;
  }

  async sendOrderConfirmationEmail(orderId: string, userEmail: string) {
    this.logger.log(
      `Queueing order confirmation email for order ID: ${orderId}`
    );

    const job = await this.notificationQueue.add(
      'order-confirmation',
      {
        orderId,
        userEmail,
        type: 'order_confirmation',
      },
      {
        priority: 8,
      }
    );

    this.logger.log(
      `Order confirmation email job created with ID: ${job.id} for order ID: ${orderId}`
    );
    return job.id;
  }

  async sendShippingNotification(orderId: string, userEmail: string, trackingNumber: string) {
    this.logger.log(
      `Queueing shipping notification for order ID: ${orderId}`
    );

    const job = await this.notificationQueue.add(
      'shipping-notification',
      {
        orderId,
        userEmail,
        trackingNumber,
        type: 'shipping_notification',
      },
      {
        priority: 6,
      }
    );

    this.logger.log(
      `Shipping notification job created with ID: ${job.id} for order ID: ${orderId}`
    );
    return job.id;
  }
}