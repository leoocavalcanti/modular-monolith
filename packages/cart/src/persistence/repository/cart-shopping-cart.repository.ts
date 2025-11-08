import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { CartShoppingCart } from '../entity/cart-shopping-cart.entity';
import { CartStatus } from '../../core/enum/cart-status.enum';

@Injectable()
export class CartShoppingCartRepository extends DefaultTypeOrmRepository<CartShoppingCart> {
  constructor(
    @InjectDataSource('cart')
    dataSource: DataSource
  ) {
    super(CartShoppingCart, dataSource.manager);
  }

  async findActiveCartByUserId(userId: string): Promise<CartShoppingCart | null> {
    return this.findOne({
      where: { userId, status: CartStatus.ACTIVE },
      relations: ['items'],
    });
  }

  async findCartByIdWithItems(cartId: string): Promise<CartShoppingCart | null> {
    return this.findOne({
      where: { id: cartId },
      relations: ['items'],
    });
  }

  async findUserCarts(userId: string): Promise<CartShoppingCart[]> {
    return this.find({
      where: { userId },
      relations: ['items'],
      order: { updatedAt: 'DESC' },
    });
  }
}