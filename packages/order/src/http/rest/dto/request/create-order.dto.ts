import { IsString, IsEmail, IsEnum, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

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

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @IsEnum(['credit_card', 'debit_card', 'pix', 'boleto'])
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto';

  @IsOptional()
  @ValidateNested()
  @Type(() => CardDetailsDto)
  cardDetails?: CardDetailsDto;

  @IsEmail()
  customerEmail: string;
}