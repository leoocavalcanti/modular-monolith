import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { OrderPurchaseOrderRepository } from '../../persistence/repository/order-purchase-order.repository';
import { OrderFulfillmentProducer } from '../../queue/producer/order-fulfillment.queue-producer';
import { OrderService } from '../service/order.service';

export type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'payment_failed';

export interface UpdateOrderStatusRequest {
  orderId: string;
  newStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  updatedBy: string; // admin user ID
}

export interface UpdateOrderStatusResult {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  trackingNumber?: string;
  updatedAt: Date;
  notificationSent: boolean;
}

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: OrderPurchaseOrderRepository,
    private readonly orderService: OrderService,
    private readonly fulfillmentQueue: OrderFulfillmentProducer,
    private readonly logger: AppLogger
  ) {}

  async execute(request: UpdateOrderStatusRequest): Promise<UpdateOrderStatusResult> {
    this.logger.log(`Updating order status`, {
      orderId: request.orderId,
      newStatus: request.newStatus,
      updatedBy: request.updatedBy,
    });

    return await runInTransaction(
      async () => {
        const order = await this.orderRepository.findOneById(request.orderId);
        
        if (!order) {
          throw new Error(`Order ${request.orderId} not found`);
        }

        const oldStatus = order.status as OrderStatus;
        
        // Validate status transition using domain logic
        this.orderService.validateStatusTransition(oldStatus, request.newStatus);

        // Update order
        order.status = request.newStatus;
        order.updatedAt = new Date();
        
        if (request.trackingNumber) {
          order.trackingNumber = request.trackingNumber;
        }

        if (request.notes) {
          order.notes = request.notes;
        }

        await this.orderRepository.save(order);

        // Handle side effects based on new status
        let notificationSent = false;
        
        if (request.newStatus === 'shipped' && request.trackingNumber) {
          // Send shipping notification
          await this.fulfillmentQueue.sendShippingNotification(
            order.id,
            order.customerEmail,
            request.trackingNumber
          );
          notificationSent = true;
          
          this.logger.log(`Shipping notification queued for order ${order.id}`, {
            trackingNumber: request.trackingNumber,
            customerEmail: order.customerEmail,
          });
        }

        this.logger.log(`Order status updated successfully`, {
          orderId: order.id,
          oldStatus,
          newStatus: request.newStatus,
          trackingNumber: request.trackingNumber,
        });

        return {
          orderId: order.id,
          oldStatus,
          newStatus: request.newStatus,
          trackingNumber: request.trackingNumber,
          updatedAt: order.updatedAt,
          notificationSent,
        };
      },
      {
        connectionName: 'order',
      }
    );
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'pending_payment': ['paid', 'cancelled', 'payment_failed'],
      'paid': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [], // Terminal status
      'cancelled': [], // Terminal status
      'payment_failed': ['paid', 'cancelled'], // Can retry payment
    };

    const allowedNextStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedNextStatuses.join(', ')}`
      );
    }
  }
}