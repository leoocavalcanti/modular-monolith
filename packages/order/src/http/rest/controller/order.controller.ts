import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CartFacade } from '@tlc/cart';
import { AuthGuard } from '@tlc/shared-module/auth';
import { plainToInstance } from 'class-transformer';
import { ClsService } from 'nestjs-cls';
import { OrderStatus } from '../../../core/enum/order-status.enum';
import { OrderService } from '../../../core/service/order.service';
import { CreateOrderFromCartUseCase } from '../../../core/use-case/create-order-from-cart.use-case';
import { CreateOrderDto } from '../dto/request/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/request/update-order-status.dto';
import { OrderResponseDto } from '../dto/response/order.dto';

interface Cart {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  items: CartItem[];
}

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  productAttributes: Record<string, unknown>;
}

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly createOrderUseCase: CreateOrderFromCartUseCase,
    private readonly cartFacade: CartFacade,
    private readonly clsService: ClsService
  ) {}

  @Get()
  async getUserOrders(@Query('status') status?: OrderStatus): Promise<OrderResponseDto[]> {
    const userId = this.clsService.get('userId');
    
    const orders = status 
      ? await this.orderService.getUserOrdersByStatus(userId, status)
      : await this.orderService.getUserOrders(userId);

    return orders.map((order) =>
      plainToInstance(OrderResponseDto, order, {
        excludeExtraneousValues: true,
      })
    );
  }

  @Get(':id')
  async getOrder(@Param('id') orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderService.getOrderById(orderId);

    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<any> {
    const userId = this.clsService.get('userId');
    const cart = await this.cartFacade.getUserActiveCart(userId);
    
    this.validateCartForOrder(cart);
    
    const result = await this.createOrderUseCase.execute({
      userId,
      items: cart.items.map((item: CartItem) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: createOrderDto.shippingAddress,
      billingAddress: createOrderDto.billingAddress,
      paymentMethod: createOrderDto.paymentMethod,
      cardDetails: createOrderDto.cardDetails 
        ? {
            cardNumber: createOrderDto.cardDetails.cardNumber,
            expiryMonth: createOrderDto.cardDetails.expiryMonth,
            expiryYear: createOrderDto.cardDetails.expiryYear,
            cvv: createOrderDto.cardDetails.cvv,
            holderName: createOrderDto.cardDetails.cardholderName,
          }
        : undefined,
      customerEmail: createOrderDto.customerEmail,
    });
    
    await this.cartFacade.completeCart(cart.id);
    
    return result;
  }

  private validateCartForOrder(cart: Cart): void {
    if (!cart.items || cart.items.length === 0) {
      throw new Error('Cannot create order from empty cart');
    }
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    const order = await this.orderService.updateOrderStatus(orderId, updateStatusDto.status);

    return plainToInstance(OrderResponseDto, order, {
      excludeExtraneousValues: true,
    });
  }
}