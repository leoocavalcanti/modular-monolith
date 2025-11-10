import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CartShoppingCart } from './cart-shopping-cart.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'CartShoppingCartItem' })
export class CartShoppingCartItem extends DefaultEntity<CartShoppingCartItem> {
  constructor(data: Partial<CartShoppingCartItem>) {
    super(data);
  }
  @Column()
  cartId: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @Column()
  productSku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column('json', { nullable: true })
  productAttributes: Record<string, any>;

  @ManyToOne(() => CartShoppingCart, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: CartShoppingCart;

  getSubtotal(): number {
    return this.price * this.quantity;
  }

  get totalPrice(): number {
    return this.getSubtotal();
  }
}