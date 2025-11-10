import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderPurchaseOrder } from './order-purchase-order.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'OrderPurchaseOrderItem' })
export class OrderPurchaseOrderItem extends DefaultEntity<OrderPurchaseOrderItem> {
  constructor(data: Partial<OrderPurchaseOrderItem>) {
    super(data);
  }
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

  getSubtotal(): number {
    return this.unitPrice * this.quantity;
  }

  get price(): number {
    return this.unitPrice;
  }
}