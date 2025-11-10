import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProcessPaymentUseCase } from '../../../core/use-case/process-payment.use-case';
import { ProcessPaymentDto } from '../dto/request/process-payment.dto';
import { PaymentResponseDto, ProcessPaymentResponseDto } from '../dto/response/payment.dto';
import { PaymentStatus } from '../../../core/enum/payment-status.enum';
import { PaymentMethod } from '../../../core/enum/payment-method.enum';

@Controller()
export class PaymentController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase
  ) {}

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Post('payments/process')
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto): Promise<ProcessPaymentResponseDto> {
    const result = await this.processPaymentUseCase.execute({
      amount: processPaymentDto.amount,
      paymentMethod: processPaymentDto.paymentMethod,
      orderId: processPaymentDto.orderId,
      customerEmail: processPaymentDto.customerEmail,
      cardDetails: processPaymentDto.cardDetails ? {
        cardNumber: processPaymentDto.cardDetails.cardNumber,
        expiryMonth: processPaymentDto.cardDetails.expiryMonth,
        expiryYear: processPaymentDto.cardDetails.expiryYear,
        cvv: processPaymentDto.cardDetails.cvv,
        holderName: processPaymentDto.cardDetails.cardholderName || 'Unknown'
      } : undefined,
    });

    return plainToInstance(ProcessPaymentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('payments/:id')
  async getPayment(@Param('id') id: string): Promise<PaymentResponseDto> {
    // TODO: Implementar GetPaymentUseCase
    return {
      id,
      orderId: 'unknown',
      amount: 0,
      currency: 'BRL',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      status: PaymentStatus.PENDING,
      transactionId: '',
      gatewayReference: '',
      customerEmail: '',
      cardDetails: {},
      pixDetails: {},
      boletoDetails: {},
      errorCode: '',
      errorMessage: '',
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      processedAt: new Date()
    };
  }
}