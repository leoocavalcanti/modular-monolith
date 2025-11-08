import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CartShoppingCart } from './cart-shopping-cart.entity';

@Entity({ name: 'CartShoppingCartItem' })
export class CartShoppingCartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  getSubtotal(): number {
    return this.price * this.quantity;
  }
}