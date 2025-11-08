import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { PaymentProcessingService } from '../../../core/service/payment-processing.service';
import { ProcessPaymentDto } from '../dto/request/process-payment.dto';
import { PaymentResponseDto, ProcessPaymentResponseDto } from '../dto/response/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentProcessingService: PaymentProcessingService
  ) {}

  @Post('process')
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto): Promise<ProcessPaymentResponseDto> {
    const result = await this.paymentProcessingService.processPayment(processPaymentDto);

    return plainToInstance(ProcessPaymentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async getPaymentStatus(@Param('id') paymentId: string): Promise<ProcessPaymentResponseDto> {
    const result = await this.paymentProcessingService.getPaymentStatus(paymentId);

    return plainToInstance(ProcessPaymentResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('order/:orderId')
  async getPaymentsByOrder(@Param('orderId') orderId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentProcessingService.getPaymentsByOrderId(orderId);

    return payments.map(payment =>
      plainToInstance(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
      })
    );
  }

  @Get()
  async getAllPayments(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentProcessingService.getAllPayments();

    return payments.map(payment =>
      plainToInstance(PaymentResponseDto, payment, {
        excludeExtraneousValues: true,
      })
    );
  }

  @Post('webhooks/simulator')
  async simulatorWebhook(@Body() webhookData: any): Promise<{ message: string }> {
    return { message: 'Webhook received successfully' };
  }
}