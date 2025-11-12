import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CartShoppingCart } from './cart-shopping-cart.entity';
import { DefaultEntity } from '@tlc/shared-module/typeorm';
import { DomainException } from '@tlc/shared-lib/common';

@Entity({ name: 'CartShoppingCartItem' })
export class CartShoppingCartItem extends DefaultEntity<CartShoppingCartItem> {
  @Column({ nullable: false })
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
    // Early validation following fakeflix patterns
    if (!data.cartId) {
      throw new DomainException('cartId is required for CartShoppingCartItem creation');
    }
    if (!data.productId) {
      throw new DomainException('productId is required for CartShoppingCartItem creation');
    }
    if (!data.productName) {
      throw new DomainException('productName is required for CartShoppingCartItem creation');
    }
    // Allow empty productSku for now - some systems may not require it
    // if (!data.productSku || data.productSku.trim() === '') {
    //   throw new DomainException('productSku is required for CartShoppingCartItem creation');
    // }
    if (!data.price || data.price <= 0) {
      throw new DomainException('price must be greater than 0 for CartShoppingCartItem creation');
    }
    if (!data.quantity || data.quantity <= 0) {
      throw new DomainException('quantity must be greater than 0 for CartShoppingCartItem creation');
    }

    const item = new CartShoppingCartItem({
      ...data,
      productAttributes: data.productAttributes || {},
    } as Partial<CartShoppingCartItem>);
    return item;
  }
}