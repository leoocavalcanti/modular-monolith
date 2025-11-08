import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@tlc/shared-module/auth';
import { ClsService } from 'nestjs-cls';
import { CartService } from '../../../core/service/cart.service';
import { CatalogFacade } from '@tlc/catalog';
import { AddToCartDto } from '../dto/request/add-to-cart.dto';
import { UpdateCartItemDto } from '../dto/request/update-cart-item.dto';
import { CartResponseDto } from '../dto/response/cart.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly catalogFacade: CatalogFacade,
    private readonly clsService: ClsService
  ) {}

  @Get()
  async getUserCart(): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    const cart = await this.cartService.getUserActiveCart(userId);

    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Post('items')
  async addToCart(@Body() addToCartDto: AddToCartDto): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    
    const product = await this.catalogFacade.getProductById(addToCartDto.productId);
    
    const available = await this.catalogFacade.checkProductAvailability(
      addToCartDto.productId,
      addToCartDto.quantity
    );
    
    if (!available) {
      throw new Error('Product is not available in the requested quantity');
    }

    const cart = await this.cartService.addToCart(userId, {
      productId: addToCartDto.productId,
      productName: product.name,
      productSku: product.sku,
      price: product.price,
      quantity: addToCartDto.quantity,
      productAttributes: addToCartDto.productAttributes,
    });

    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Put('items/:productId')
  async updateCartItem(
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto
  ): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    
    const available = await this.catalogFacade.checkProductAvailability(
      productId,
      updateCartItemDto.quantity
    );
    
    if (!available) {
      throw new Error('Product is not available in the requested quantity');
    }

    const cart = await this.cartService.updateCartItemQuantity(
      userId,
      productId,
      updateCartItemDto.quantity
    );

    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete('items/:productId')
  async removeFromCart(@Param('productId') productId: string): Promise<CartResponseDto> {
    const userId = this.clsService.get('userId');
    const cart = await this.cartService.removeFromCart(userId, productId);

    return plainToInstance(CartResponseDto, cart, {
      excludeExtraneousValues: true,
    });
  }

  @Delete()
  async clearCart(): Promise<{ message: string }> {
    const userId = this.clsService.get('userId');
    await this.cartService.clearCart(userId);
    
    return { message: 'Cart cleared successfully' };
  }
}