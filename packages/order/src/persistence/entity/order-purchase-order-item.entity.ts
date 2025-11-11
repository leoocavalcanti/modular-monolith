import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { OrderPurchaseOrder } from './order-purchase-order.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'OrderPurchaseOrderItem' })
export class OrderPurchaseOrderItem extends DefaultEntity<OrderPurchaseOrderItem> {
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

  static create(data: {
    orderId: string;
    productId: string;
    productName: string;
    productSku: string;
    unitPrice: number;
    quantity: number;
    productAttributes?: Record<string, any>;
    order?: OrderPurchaseOrder;
  }): OrderPurchaseOrderItem {
    const item = new OrderPurchaseOrderItem({
      ...data,
      productAttributes: data.productAttributes || {},
    } as Partial<OrderPurchaseOrderItem>);
    return item;
  }
}