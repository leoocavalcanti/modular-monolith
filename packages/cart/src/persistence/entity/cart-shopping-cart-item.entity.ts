import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CartShoppingCart } from './cart-shopping-cart.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';

@Entity({ name: 'CartShoppingCartItem' })
export class CartShoppingCartItem extends DefaultEntity<CartShoppingCartItem> {
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
  productAttributes: Record<string, unknown>;

  @ManyToOne(() => CartShoppingCart, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: CartShoppingCart;

  getSubtotal(): number {
    return this.price * this.quantity;
  }

  get totalPrice(): number {
    return this.getSubtotal();
  }

  static create(data: {
    cartId: string;
    productId: string;
    productName: string;
    productSku: string;
    price: number;
    quantity: number;
    productAttributes?: Record<string, unknown>;
    cart?: CartShoppingCart;
  }): CartShoppingCartItem {
    const item = new CartShoppingCartItem({
      ...data,
      productAttributes: data.productAttributes || {},
    } as Partial<CartShoppingCartItem>);
    return item;
  }
}