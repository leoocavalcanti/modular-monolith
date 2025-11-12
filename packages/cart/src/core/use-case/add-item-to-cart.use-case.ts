import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { CartShoppingCart } from '../../persistence/entity/cart-shopping-cart.entity';
import { CartShoppingCartItem } from '../../persistence/entity/cart-shopping-cart-item.entity';
import { CartShoppingCartRepository } from '../../persistence/repository/cart-shopping-cart.repository';
import { CartShoppingCartItemRepository } from '../../persistence/repository/cart-shopping-cart-item.repository';

export interface AddItemToCartRequest {
  userId: string;
  productId: string;
  productName: string;
  productSku: string;
  productPrice: number;
  quantity: number;
  productImageUrl?: string;
  productAttributes?: Record<string, unknown>;
}

export interface AddItemToCartResult {
  cartId: string;
  itemId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  cartItemsCount: number;
  cartTotal: number;
}

@Injectable()
export class AddItemToCartUseCase {
  constructor(
    private readonly cartRepository: CartShoppingCartRepository,
    private readonly cartItemRepository: CartShoppingCartItemRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(request: AddItemToCartRequest): Promise<AddItemToCartResult> {
    this.logger.log(`Adding item to cart`, {
      userId: request.userId,
      productId: request.productId,
      quantity: request.quantity,
    });

    if (request.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (request.productPrice <= 0) {
      throw new Error('Product price must be greater than 0');
    }

    return await runInTransaction(
      async () => {
        // Find or create cart for user
        let cart = await this.cartRepository.findByUserId(request.userId);
        
        if (!cart) {
          cart = new CartShoppingCart({
            userId: request.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          cart = await this.cartRepository.save(cart);
        }

        // Check if product already exists in cart
        let cartItem = await this.cartItemRepository.findByCartAndProduct(
          cart.id, 
          request.productId
        );

        if (cartItem) {
          // Update existing item quantity
          cartItem.quantity += request.quantity;
          cartItem = await this.cartItemRepository.save(cartItem);

          this.logger.log(`Updated existing cart item`, {
            cartId: cart.id,
            itemId: cartItem.id,
            productId: request.productId,
            newQuantity: cartItem.quantity,
            totalPrice: cartItem.totalPrice,
          });
        } else {
          // Create new cart item using static factory method
          cartItem = CartShoppingCartItem.create({
            cartId: cart.id,
            productId: request.productId,
            productName: request.productName,
            productSku: request.productSku || 'SKU-' + request.productId.substr(0, 8),
            price: request.productPrice,
            quantity: request.quantity,
            productAttributes: request.productAttributes,
            cart: cart,
          });
          cartItem = await this.cartItemRepository.save(cartItem);

          this.logger.log(`Added new item to cart`, {
            cartId: cart.id,
            itemId: cartItem.id,
            productId: request.productId,
            quantity: cartItem.quantity,
            totalPrice: cartItem.totalPrice,
          });
        }

        // Update cart timestamp
        cart.updatedAt = new Date();
        await this.cartRepository.save(cart);

        // Calculate cart totals
        const cartItems = await this.cartItemRepository.findByCartId(cart.id);
        const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

        this.logger.log(`Cart updated successfully`, {
          cartId: cart.id,
          userId: request.userId,
          cartItemsCount,
          cartTotal,
        });

        return {
          cartId: cart.id,
          itemId: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          totalPrice: cartItem.totalPrice,
          cartItemsCount,
          cartTotal,
        };
      },
      {
        connectionName: 'cart',
      }
    );
  }
}