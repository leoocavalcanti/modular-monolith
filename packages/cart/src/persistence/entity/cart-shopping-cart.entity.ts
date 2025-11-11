import { Entity, Column, OneToMany } from 'typeorm';
import { CartStatus } from '../../core/enum/cart-status.enum';
import { CartShoppingCartItem } from './cart-shopping-cart-item.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'CartShoppingCart' })
export class CartShoppingCart extends DefaultEntity<CartShoppingCart> {
  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  status: CartStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => CartShoppingCartItem, item => item.cart, { cascade: true })
  items: CartShoppingCartItem[];

  calculateTotal(): number {
    return this.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  }

  getTotalItems(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  static create(data: {
    userId: string;
    status?: CartStatus;
    totalAmount?: number;
    items?: CartShoppingCartItem[];
  }): CartShoppingCart {
    const cart = new CartShoppingCart({
      ...data,
      status: data.status || CartStatus.ACTIVE,
      totalAmount: data.totalAmount || 0,
      items: data.items || [],
    } as Partial<CartShoppingCart>);
    return cart;
  }
}