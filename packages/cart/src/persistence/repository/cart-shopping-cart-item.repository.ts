import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DefaultTypeOrmRepository } from '@tlc/shared-module/typeorm';
import { DataSource } from 'typeorm';
import { CartShoppingCartItem } from '../entity/cart-shopping-cart-item.entity';

@Injectable()
export class CartShoppingCartItemRepository extends DefaultTypeOrmRepository<CartShoppingCartItem> {
  constructor(
    @InjectDataSource('cart')
    dataSource: DataSource
  ) {
    super(CartShoppingCartItem, dataSource.manager);
  }

  async findByCartIdAndProductId(cartId: string, productId: string): Promise<CartShoppingCartItem | null> {
    return this.findOne({
      where: { cartId, productId },
    });
  }

  async findByCartId(cartId: string): Promise<CartShoppingCartItem[]> {
    return this.find({
      where: { cartId },
      order: { createdAt: 'DESC' },
    });
  }
}