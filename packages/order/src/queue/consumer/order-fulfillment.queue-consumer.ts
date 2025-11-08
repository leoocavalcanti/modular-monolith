import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { AppLogger } from '@tlc/shared-module/logger';
import { QUEUES } from '@tlc/shared-module/queue';
import { Job } from 'bullmq';
import { OrderPurchaseOrderRepository } from '../../persistence/repository/order-purchase-order.repository';
import { OrderFulfillmentJobData } from '../producer/order-fulfillment.queue-producer';
import { OrderNotFoundException } from '../../core/exception/order-not-found.exception';

@Processor(QUEUES.ORDER_FULFILLMENT)
export class OrderFulfillmentConsumer extends WorkerHost {
  constructor(
    private readonly orderRepository: OrderPurchaseOrderRepository,
    private readonly logger: AppLogger
  ) {
    super();
  }

  async process(job: Job<OrderFulfillmentJobData, void>) {
    const { orderId, items } = job.data;
    this.logger.log(`Fulfilling order ${orderId}`);

    const order = await this.orderRepository.findOneById(orderId);
    if (!order) {
      throw new OrderNotFoundException(`Order with ID ${orderId} not found`);
    }

    try {
      // Simulate inventory check and reservation
      await this.checkInventory(items);
      
      // Simulate order packaging and shipping
      await this.packageOrder(orderId);
      const trackingNumber = await this.shipOrder(orderId);
      
      // Update order status
      await this.orderRepository.updateStatus(orderId, 'shipped');
      
      this.logger.log(`Order ${orderId} fulfilled successfully with tracking: ${trackingNumber}`);
      
      return { trackingNumber };
    } catch (error) {
      this.logger.error(`Error fulfilling order ${orderId}`, {
        error,
        orderId,
      });
      await this.orderRepository.updateStatus(orderId, 'fulfillment_failed');
      throw new Error(`Failed to fulfill order ID ${orderId}`);
    }
  }

  private async checkInventory(items: Array<{ productId: string; quantity: number }>) {
    this.logger.log('Checking inventory for order items');
    
    for (const item of items) {
      // Simulate inventory check
      const available = Math.random() > 0.1; // 90% success rate
      if (!available) {
        throw new Error(`Insufficient inventory for product ${item.productId}`);
      }
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async packageOrder(orderId: string) {
    this.logger.log(`Packaging order ${orderId}`);
    
    // Simulate packaging time
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private async shipOrder(orderId: string): Promise<string> {
    this.logger.log(`Shipping order ${orderId}`);
    
    // Generate mock tracking number
    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Simulate shipping processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return trackingNumber;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<OrderFulfillmentJobData>, error: Error) {
    this.logger.error(`Order fulfillment job failed: ${job.id}`, {
      job: job.data,
      error,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<OrderFulfillmentJobData>, result: any) {
    this.logger.log(`Order fulfillment job completed: ${job.id}`, {
      orderId: job.data.orderId,
      trackingNumber: result?.trackingNumber,
    });
  }
}