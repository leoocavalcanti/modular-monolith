import { Injectable } from '@nestjs/common';
import { PaymentProcessingService } from '../../core/service/payment-processing.service';

@Injectable()
export class PaymentFacade {
  constructor(private readonly paymentProcessingService: PaymentProcessingService) {}

  // TODO: Implementar métodos da facade quando necessário
}