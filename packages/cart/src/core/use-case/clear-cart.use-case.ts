import { Injectable } from '@nestjs/common';
import { AppLogger } from '@tlc/shared-module/logger';
import { runInTransaction } from 'typeorm-transactional';
import { CartShoppingCartRepository } from '../../persistence/repository/cart-shopping-cart.repository';
import { CartShoppingCartItemRepository } from '../../persistence/repository/cart-shopping-cart-item.repository';

export interface ClearCartRequest {
  userId: string;
  reason: 'checkout' | 'manual_clear' | 'session_expired';
}

export interface ClearCartResult {
  cartId: string;
  itemsRemoved: number;
  totalValueRemoved: number;
  clearedAt: Date;
}

@Injectable()
export class ClearCartUseCase {
  constructor(
    private readonly cartRepository: CartShoppingCartRepository,
    private readonly cartItemRepository: CartShoppingCartItemRepository,
    private readonly logger: AppLogger
  ) {}

  async execute(request: ClearCartRequest): Promise<ClearCartResult> {
    this.logger.log(`Clearing cart for user`, {
      userId: request.userId,
      reason: request.reason,
    });

    return await runInTransaction(
      async () => {
        const cart = await this.cartRepository.findByUserId(request.userId);
        
        if (!cart) {
          throw new Error(`Cart not found for user ${request.userId}`);
        }

        // Get current cart items for stats
        const cartItems = await this.cartItemRepository.findByCartId(cart.id);
        const itemsRemoved = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalValueRemoved = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

        // Remove all cart items
        await this.cartItemRepository.removeByCartId(cart.id);

        // Update cart timestamp
        cart.updatedAt = new Date();
        await this.cartRepository.save(cart);

        const clearedAt = new Date();

        this.logger.log(`Cart cleared successfully`, {
          cartId: cart.id,
          userId: request.userId,
          reason: request.reason,
          itemsRemoved,
          totalValueRemoved,
          clearedAt,
        });

        return {
          cartId: cart.id,
          itemsRemoved,
          totalValueRemoved,
          clearedAt,
        };
      },
      {
        connectionName: 'cart',
      }
    );
  }
}