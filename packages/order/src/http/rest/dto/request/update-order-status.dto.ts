import { IsEnum } from 'class-validator';
import { OrderStatus } from '../../../../core/enum/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}