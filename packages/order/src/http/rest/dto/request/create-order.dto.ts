import { IsString, IsEmail, IsEnum, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString({ message: 'Street must be a valid string' })
  street: string;

  @IsString({ message: 'City must be a valid string' })
  city: string;

  @IsString({ message: 'State must be a valid string' })
  state: string;

  @IsString({ message: 'ZIP code must be a valid string' })
  zipCode: string;

  @IsString({ message: 'Country must be a valid string' })
  country: string;
}

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

export class CreateOrderDto {
  @ValidateNested({ message: 'Shipping address must be valid' })
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested({ message: 'Billing address must be valid' })
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @IsEnum(['credit_card', 'debit_card', 'pix', 'boleto'], { message: 'Payment method must be one of: credit_card, debit_card, pix, boleto' })
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto';

  @IsOptional()
  @ValidateNested({ message: 'Card details must be valid' })
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;

  @IsEmail({}, { message: 'Customer email must be a valid email address' })
  customerEmail: string;
}