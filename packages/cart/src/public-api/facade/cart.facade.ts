import { Injectable } from '@nestjs/common';
import { CartService } from '../../core/service/cart.service';
import { CartShoppingCart } from '../../persistence/entity/cart-shopping-cart.entity';

export interface CartOrderApi {
  getCartById(cartId: string): Promise<CartShoppingCart>;
  completeCart(cartId: string): Promise<CartShoppingCart>;
  getUserActiveCart(userId: string): Promise<CartShoppingCart>;
}

@Injectable()
export class CartFacade implements CartOrderApi {
  constructor(private readonly cartService: CartService) {}

  async getCartById(cartId: string): Promise<CartShoppingCart> {
    return this.cartService.getCartById(cartId);
  }

  async completeCart(cartId: string): Promise<CartShoppingCart> {
    return this.cartService.completeCart(cartId);
  }

  async getUserActiveCart(userId: string): Promise<CartShoppingCart> {
    return this.cartService.getUserActiveCart(userId);
  }
}