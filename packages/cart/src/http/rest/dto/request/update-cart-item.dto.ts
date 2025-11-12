import { IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber({}, { message: 'Quantity must be a valid number' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}