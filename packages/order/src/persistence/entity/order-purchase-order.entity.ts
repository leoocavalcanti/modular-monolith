import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderStatus } from '../../core/enum/order-status.enum';
import { PaymentStatus } from '../../core/enum/payment-status.enum';
import { OrderPurchaseOrderItem } from './order-purchase-order-item.entity';

@Entity({ name: 'OrderPurchaseOrder' })
export class OrderPurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  calculateSubtotal(): number {
    return this.items?.reduce((total, item) => total + item.getSubtotal(), 0) || 0;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.taxAmount + this.shippingAmount;
  }
}