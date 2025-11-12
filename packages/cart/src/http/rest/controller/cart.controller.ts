import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@tlc/shared-module/auth';
import { ClsService } from 'nestjs-cls';
import { plainToInstance } from 'class-transformer';
import { CartService } from '../../../core/service/cart.service';
import { AddItemToCartUseCase } from '../../../core/use-case/add-item-to-cart.use-case';
import { RemoveItemFromCartUseCase } from '../../../core/use-case/remove-item-from-cart.use-case';
import { ClearCartUseCase } from '../../../core/use-case/clear-cart.use-case';
import { AddToCartDto } from '../dto/request/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/request/update-cart-item.dto';
import { CartResponseDto } from '../dto/response/cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly addItemToCartUseCase: AddItemToCartUseCase,
    private readonly removeItemFromCartUseCase: RemoveItemFromCartUseCase,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getCart(): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    const cart = await this.cartService.getUserActiveCart(userId);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Post('items')
  @UseGuards(AuthGuard)
  async addToCart(@Body() addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    const cart = await this.cartService.addToCart(userId, {
      productId: addToCartDto.productId,
      productName: addToCartDto.productName,
      productSku: addToCartDto.productSku,
      price: addToCartDto.price,
      quantity: addToCartDto.quantity,
      productAttributes: addToCartDto.productAttributes,
    });
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Put('items/:productId')
  @UseGuards(AuthGuard)
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() updateDto: UpdateCartItemDto
  ): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    const cart = await this.cartService.updateCartItemQuantity(
      userId,
      productId,
      updateDto.quantity
    );
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('items/:productId')
  @UseGuards(AuthGuard)
  async removeFromCart(@Param('productId') productId: string): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    const result = await this.removeItemFromCartUseCase.execute({
      userId,
      productId,
    });
    const cart = await this.cartService.getCartById(result.cartId);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete()
  @UseGuards(AuthGuard)
  async clearCart(): Promise<{ message: string }> {
    const userId = this.clsService.get('userId');
    await this.clearCartUseCase.execute({
      userId,
      reason: 'manual_clear',
    });
    return { message: 'Cart cleared successfully' };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}