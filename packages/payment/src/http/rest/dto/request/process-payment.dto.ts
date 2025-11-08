import { IsString, IsNumber, IsEmail, IsEnum, IsOptional, ValidateNested, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../../core/enum/payment-method.enum';

class CardDetailsDto {
  @IsString()
  cardNumber: string;

  @IsString()
  expiryMonth: string;

  @IsString()
  expiryYear: string;

  @IsString()
  cvv: string;

  @IsString()
  cardholderName: string;
}

export class ProcessPaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;
}