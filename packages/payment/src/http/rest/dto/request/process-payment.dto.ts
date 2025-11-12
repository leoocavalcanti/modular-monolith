import { IsString, IsNumber, IsEmail, IsEnum, IsOptional, ValidateNested, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../../core/enum/payment-method.enum';

class CardDetailsDto {
  @IsString({ message: 'Card number must be a valid string' })
  cardNumber: string;

  @IsString({ message: 'Expiry month must be a valid string' })
  expiryMonth: string;

  @IsString({ message: 'Expiry year must be a valid string' })
  expiryYear: string;

  @IsString({ message: 'CVV must be a valid string' })
  cvv: string;

  @IsString({ message: 'Cardholder name must be a valid string' })
  cardholderName: string;
}

export class ProcessPaymentDto {
  @IsString({ message: 'Order ID must be a valid string' })
  orderId: string;

  @IsNumber({}, { message: 'Amount must be a valid number' })
  @IsPositive({ message: 'Amount must be greater than zero' })
  amount: number;

  @IsString({ message: 'Currency must be a valid string' })
  currency: string;

  @IsEnum(PaymentMethod, { message: 'Payment method must be a valid payment method' })
  paymentMethod: PaymentMethod;

  @IsEmail({}, { message: 'Customer email must be a valid email address' })
  customerEmail: string;

  @IsOptional()
  @ValidateNested({ message: 'Card details must be valid' })
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;
}