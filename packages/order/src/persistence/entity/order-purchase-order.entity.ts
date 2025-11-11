import { Entity, Column, OneToMany } from 'typeorm';
import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';
import { OrderPurchaseOrderItem } from './order-purchase-order-item.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'OrderPurchaseOrder' })
export class OrderPurchaseOrder extends DefaultEntity<OrderPurchaseOrder> {
  @Column()
  orderNumber: string;

  @Column()
  userId: string;

  @Column()
  cartId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  paymentTransactionId: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  estimatedDeliveryDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column('json')
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column('json')
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @OneToMany(() => OrderPurchaseOrderItem, item => item.order, { cascade: true })
  items: OrderPurchaseOrderItem[];

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  calculateSubtotal(): number {
    return this.items?.reduce((total, item) => total + item.getSubtotal(), 0) || 0;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.taxAmount + this.shippingAmount;
  }

  static create(data: {
    orderNumber: string;
    userId: string;
    cartId: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentId?: string;
    paymentTransactionId?: string;
    trackingNumber?: string;
    customerEmail?: string;
    notes?: string;
    estimatedDeliveryDate?: Date;
    totalAmount: number;
    taxAmount?: number;
    shippingAmount?: number;
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
    items?: OrderPurchaseOrderItem[];
    metadata?: Record<string, any>;
  }): OrderPurchaseOrder {
    const order = new OrderPurchaseOrder({
      ...data,
      status: data.status || OrderStatus.PENDING,
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      taxAmount: data.taxAmount || 0,
      shippingAmount: data.shippingAmount || 0,
      items: data.items || [],
      metadata: data.metadata || {},
    } as Partial<OrderPurchaseOrder>);
    return order;
  }
}