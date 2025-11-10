import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { CartShoppingCartItem } from '../../persistence/entity/cart-shopping-cart-item.entity';
import { CartShoppingCart } from '../../persistence/entity/cart-shopping-cart.entity';
import { CartShoppingCartItemRepository } from '../../persistence/repository/cart-shopping-cart-item.repository';
import { CartShoppingCartRepository } from '../../persistence/repository/cart-shopping-cart.repository';
import { CartStatus } from '../enum/cart-status.enum';

export interface AddToCartData {
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  productAttributes?: Record<string, any>;
}

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartShoppingCartRepository,
    private readonly cartItemRepository: CartShoppingCartItemRepository
  ) {}

  async getUserActiveCart(userId: string): Promise<CartShoppingCart> {
    let cart = await this.cartRepository.findActiveCartByUserId(userId);

    if (!cart) {
      cart = await this.createCart(userId);
    }

    return cart;
  }

  async getCartById(cartId: string): Promise<CartShoppingCart> {
    const cart = await this.cartRepository.findCartByIdWithItems(cartId);
    
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found`);
    }

    return cart;
  }

  @Transactional({ connectionName: 'cart' })
  async addToCart(userId: string, data: AddToCartData): Promise<CartShoppingCart> {
    const cart = await this.getUserActiveCart(userId);
    
    const existingItem = await this.cartItemRepository.findByCartIdAndProductId(
      cart.id, 
      data.productId
    );

    if (existingItem) {
      existingItem.quantity += data.quantity;
      existingItem.price = data.price;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = new CartShoppingCartItem({
        cartId: cart.id,
        productId: data.productId,
        productName: data.productName,
        productSku: data.productSku,
        price: data.price,
        quantity: data.quantity,
        productAttributes: data.productAttributes || {},
      });
      
      await this.cartItemRepository.save(cartItem);
    }

    return this.updateCartTotal(cart.id);
  }

  @Transactional({ connectionName: 'cart' })
  async removeFromCart(userId: string, productId: string): Promise<CartShoppingCart> {
    const cart = await this.getUserActiveCart(userId);
    
    const cartItem = await this.cartItemRepository.findByCartIdAndProductId(
      cart.id, 
      productId
    );

    if (!cartItem) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    await this.cartItemRepository.remove(cartItem);
    
    return this.updateCartTotal(cart.id);
  }

  @Transactional({ connectionName: 'cart' })
  async updateCartItemQuantity(
    userId: string, 
    productId: string, 
    quantity: number
  ): Promise<CartShoppingCart> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cart = await this.getUserActiveCart(userId);
    
    const cartItem = await this.cartItemRepository.findByCartIdAndProductId(
      cart.id, 
      productId
    );

    if (!cartItem) {
      throw new NotFoundException(`Product ${productId} not found in cart`);
    }

    cartItem.quantity = quantity;
    await this.cartItemRepository.save(cartItem);
    
    return this.updateCartTotal(cart.id);
  }

  @Transactional({ connectionName: 'cart' })
  async clearCart(userId: string): Promise<void> {
    const cart = await this.getUserActiveCart(userId);
    const items = await this.cartItemRepository.findByCartId(cart.id);
    
    if (items.length > 0) {
      await this.cartItemRepository.remove(items);
    }
    
    await this.updateCartTotal(cart.id);
  }

  @Transactional({ connectionName: 'cart' })
  async completeCart(cartId: string): Promise<CartShoppingCart> {
    const cart = await this.getCartById(cartId);
    cart.status = CartStatus.COMPLETED;
    return this.cartRepository.save(cart);
  }

  private async createCart(userId: string): Promise<CartShoppingCart> {
    const cart = new CartShoppingCart({
      userId: userId,
      status: CartStatus.ACTIVE,
      totalAmount: 0,
    });
    
    return this.cartRepository.save(cart);
  }

  private async updateCartTotal(cartId: string): Promise<CartShoppingCart> {
    const cart = await this.getCartById(cartId);
    cart.totalAmount = cart.calculateTotal();
    return this.cartRepository.save(cart);
  }
}