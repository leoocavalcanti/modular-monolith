import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderPurchaseOrder } from './order-purchase-order.entity';

@Entity({ name: 'OrderPurchaseOrderItem' })
export class OrderPurchaseOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  productSku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column()
  quantity: number;

  @Column('json', { nullable: true })
  productAttributes: Record<string, any>;

  @ManyToOne(() => OrderPurchaseOrder, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: OrderPurchaseOrder;

  @CreateDateColumn()
  createdAt: Date;

  getSubtotal(): number {
    return this.unitPrice * this.quantity;
  }
}