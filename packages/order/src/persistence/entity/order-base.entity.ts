import { DefaultEntity } from '@tlc/shared-module/typeorm';
import { Column, Entity, TableInheritance, ChildEntity, OneToMany, JoinColumn } from 'typeorm';
import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';
import { OrderPurchaseOrderItem } from './order-purchase-order-item.entity';

export enum OrderType {
  PURCHASE = 'purchase',
  SUBSCRIPTION = 'subscription',
  RENTAL = 'rental',
}

@Entity({ name: 'Order' })
@TableInheritance({ column: { type: 'enum', name: 'type', enum: OrderType } })
export abstract class OrderBase extends DefaultEntity<OrderBase> {
  @Column({ nullable: false, type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'varchar', unique: true, nullable: false })
  orderNumber: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  totalAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'json', nullable: true })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;
}

@ChildEntity(OrderType.PURCHASE)
export class PurchaseOrder extends OrderBase {
  @OneToMany(() => OrderPurchaseOrderItem, item => item.order, { cascade: true })
  @JoinColumn()
  items: OrderPurchaseOrderItem[];

  @Column({ type: 'varchar', nullable: true })
  paymentMethodId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  static create(data: {
    orderNumber: string;
    userId: string;
    totalAmount: number;
    currency?: string;
    shippingAddress?: any;
    paymentMethodId?: string;
    shippingCost?: number;
    taxAmount?: number;
  }): PurchaseOrder {
    return new PurchaseOrder({
      ...data,
      type: OrderType.PURCHASE,
      currency: data.currency || 'USD',
      shippingCost: data.shippingCost || 0,
      taxAmount: data.taxAmount || 0,
    } as Partial<PurchaseOrder>);
  }

  calculateTotal(): number {
    const itemsTotal = this.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    return itemsTotal + this.shippingCost + this.taxAmount;
  }
}

@ChildEntity(OrderType.SUBSCRIPTION)
export class SubscriptionOrder extends OrderBase {
  @Column({ type: 'varchar', nullable: false })
  planId: string;

  @Column({ type: 'timestamp', nullable: false })
  subscriptionStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionEndDate: Date;

  @Column({ type: 'varchar', nullable: false })
  billingCycle: 'monthly' | 'yearly' | 'quarterly';

  @Column({ type: 'boolean', default: true })
  autoRenew: boolean;

  @Column({ type: 'timestamp', nullable: true })
  nextBillingDate: Date;

  static create(data: {
    orderNumber: string;
    userId: string;
    totalAmount: number;
    planId: string;
    subscriptionStartDate: Date;
    billingCycle: 'monthly' | 'yearly' | 'quarterly';
    subscriptionEndDate?: Date;
    autoRenew?: boolean;
  }): SubscriptionOrder {
    return new SubscriptionOrder({
      ...data,
      type: OrderType.SUBSCRIPTION,
      autoRenew: data.autoRenew ?? true,
    } as Partial<SubscriptionOrder>);
  }
}

@ChildEntity(OrderType.RENTAL)
export class RentalOrder extends OrderBase {
  @Column({ type: 'timestamp', nullable: false })
  rentalStartDate: Date;

  @Column({ type: 'timestamp', nullable: false })
  rentalEndDate: Date;

  @Column({ type: 'int', nullable: false })
  rentalDurationDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  securityDeposit: number;

  @Column({ type: 'timestamp', nullable: true })
  returnedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  returnCondition: string;

  static create(data: {
    orderNumber: string;
    userId: string;
    totalAmount: number;
    rentalStartDate: Date;
    rentalEndDate: Date;
    rentalDurationDays: number;
    securityDeposit?: number;
  }): RentalOrder {
    return new RentalOrder({
      ...data,
      type: OrderType.RENTAL,
      securityDeposit: data.securityDeposit || 0,
    } as Partial<RentalOrder>);
  }
}