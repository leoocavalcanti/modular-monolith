import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CartStatus } from '../../core/enum/cart-status.enum';
import { CartShoppingCartItem } from './cart-shopping-cart-item.entity';

@Entity({ name: 'CartShoppingCart' })
export class CartShoppingCart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  calculateTotal(): number {
    return this.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  }

  getTotalItems(): number {
    return this.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  }
}