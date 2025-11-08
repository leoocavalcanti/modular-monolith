import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { PaymentApiClient } from '../../http/client/payment-api.client';
import { OrderPurchaseOrder } from '../../persistence/entity/order-purchase-order.entity';
import { OrderPurchaseOrderRepository } from '../../persistence/repository/order-purchase-order.repository';
import { OrderFulfillmentProducer } from '../../queue/producer/order-fulfillment.queue-producer';
import { OrderService } from '../service/order.service';

export interface CreateOrderRequest {
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  cardDetails?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  };
  customerEmail: string;
}

export interface CreateOrderResult {
  orderId: string;
  totalAmount: number;
  status: string;
  paymentTransactionId: string;
  estimatedDeliveryDate: Date;
  fulfillmentJobId?: string;
}

@Injectable()
export class CreateOrderFromCartUseCase {
  constructor(
    private readonly orderRepository: OrderPurchaseOrderRepository,
    private readonly orderService: OrderService,
    private readonly paymentClient: PaymentApiClient,
    private readonly fulfillmentQueue: OrderFulfillmentProducer,
    private readonly logger: AppLogger
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResult> {
    this.logger.log(`Creating order for user ${request.userId}`, {
      userId: request.userId,
      itemsCount: request.items.length,
      paymentMethod: request.paymentMethod,
    });

    return await runInTransaction(
      async () => {
        // Use domain service to validate and create order items
        const orderItems = this.orderService.createOrderItemsFromCartItems(
          request.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.price,
            quantity: item.quantity,
          }))
        );

        // Calculate amounts using domain logic
        const shippingAmount = this.orderService.calculateShippingAmount(request.items);
        const taxAmount = this.orderService.calculateTaxAmount(request.items);
        const totalAmount = this.orderService.calculateOrderTotal(
          request.items,
          shippingAmount,
          taxAmount
        );

        // Create order with domain logic
        const order = new OrderPurchaseOrder({
          userId: request.userId,
          orderNumber: this.orderService.generateOrderNumber(),
          totalAmount,
          shippingAmount,
          taxAmount,
          status: 'pending_payment',
          items: orderItems,
          shippingAddress: request.shippingAddress,
          billingAddress: request.billingAddress,
          customerEmail: request.customerEmail,
          estimatedDeliveryDate: this.orderService.calculateEstimatedDeliveryDate(request.shippingAddress),
          createdAt: new Date(),
        });

        const savedOrder = await this.orderRepository.save(order);

        // Process payment
        const paymentResult = await this.paymentClient.processPayment({
          amount: totalAmount,
          paymentMethod: request.paymentMethod,
          cardDetails: request.cardDetails,
          orderId: savedOrder.id,
          customerEmail: request.customerEmail,
        });

        // Apply payment result using domain logic
        this.orderService.applyPaymentResultToOrder(savedOrder, paymentResult);
        
        const updatedOrder = await this.orderRepository.save(savedOrder);

          // Queue for fulfillment
          const fulfillmentJobId = await this.fulfillmentQueue.fulfillOrder(savedOrder);
          
          // Send confirmation email
          await this.fulfillmentQueue.sendOrderConfirmationEmail(
            savedOrder.id, 
            request.customerEmail
          );

          this.logger.log(`Order created and paid successfully`, {
            orderId: savedOrder.id,
            paymentTransactionId: paymentResult.transactionId,
            fulfillmentJobId,
          });

          return {
            orderId: savedOrder.id,
            totalAmount: savedOrder.totalAmount,
            status: savedOrder.status,
            paymentTransactionId: paymentResult.transactionId,
            estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
            fulfillmentJobId,
          };
        } else {
          // Payment pending or failed
          savedOrder.status = paymentResult.status === 'failed' ? 'payment_failed' : 'pending_payment';
          savedOrder.paymentTransactionId = paymentResult.transactionId;
          await this.orderRepository.save(savedOrder);

          this.logger.log(`Order created but payment ${paymentResult.status}`, {
            orderId: savedOrder.id,
            paymentStatus: paymentResult.status,
            paymentTransactionId: paymentResult.transactionId,
          });

          return {
            orderId: savedOrder.id,
            totalAmount: savedOrder.totalAmount,
            status: savedOrder.status,
            paymentTransactionId: paymentResult.transactionId,
            estimatedDeliveryDate: savedOrder.estimatedDeliveryDate,
          };
        }
      },
      {
        connectionName: 'order',
      }
    );
  }

  private calculateEstimatedDelivery(): Date {
    // Business logic: 5-7 business days
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    return deliveryDate;
  }
}