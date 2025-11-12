import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { NotFoundDomainException } from '@tlc/shared-lib/common';
import { CartShoppingCartRepository } from '../../persistence/repository/cart-shopping-cart.repository';
import { CartShoppingCartItemRepository } from '../../persistence/repository/cart-shopping-cart-item.repository';

export interface RemoveItemFromCartRequest {
  userId: string;
  productId: string;
}

export interface RemoveItemFromCartResult {
  cartId: string;
  productId: string;
  cartItemsCount: number;
  cartTotal: number;
}

@Injectable()
export class RemoveItemFromCartUseCase {
  constructor(
    private readonly cartRepository: CartShoppingCartRepository,
    private readonly cartItemRepository: CartShoppingCartItemRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(request: RemoveItemFromCartRequest): Promise<RemoveItemFromCartResult> {
    this.logger.log(`Removing item from cart`, {
      userId: request.userId,
      productId: request.productId,
    });

    return await runInTransaction(
      async () => {
        const cart = await this.cartRepository.findByUserId(request.userId);
        if (!cart) {
          throw new NotFoundDomainException(`Cart not found for user ${request.userId}`);
        }

        const cartItem = await this.cartItemRepository.findByCartAndProduct(
          cart.id,
          request.productId
        );

        if (!cartItem) {
          throw new NotFoundDomainException(`Product ${request.productId} not found in cart`);
        }

        await this.cartItemRepository.remove(cartItem);

        // Update cart timestamp
        cart.updatedAt = new Date();
        await this.cartRepository.save(cart);

        // Calculate cart totals
        const cartItems = await this.cartItemRepository.findByCartId(cart.id);
        const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

        this.logger.log(`Item removed from cart successfully`, {
          cartId: cart.id,
          userId: request.userId,
          productId: request.productId,
          cartItemsCount,
          cartTotal,
        });

        return {
          cartId: cart.id,
          productId: request.productId,
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