import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@tlc/shared-module/auth';
import { ClsService } from 'nestjs-cls';
import { plainToInstance } from 'class-transformer';
import { CartService } from '../../../core/service/cart.service';
import { AddToCartDto } from '../dto/request/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/request/update-cart-item.dto';
import { CartResponseDto } from '../dto/response/cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
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
    const cart = await this.cartService.addToCart(userId, addToCartDto);
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
    const cart = await this.cartService.removeFromCart(userId, productId);
    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete()
  @UseGuards(AuthGuard)
  async clearCart(): Promise<{ message: string }> {
    const userId = this.clsService.get('userId');
    await this.cartService.clearCart(userId);
    return { message: 'Cart cleared successfully' };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}