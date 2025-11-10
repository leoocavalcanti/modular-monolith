import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '@tlc/shared-module/queue';
import { PaymentPersistenceModule } from './src/persistence/payment-persistence.module';
import { PaymentProcessingService } from './src/core/service/payment-processing.service';
import { PaymentSimulatorService } from './src/core/service/payment-simulator.service';
import { PaymentController } from './src/http/rest/controller/payment.controller';
import { PaymentFacade } from './src/public-api/facade/payment.facade';
import { PaymentProcessingProducer } from './src/queue/producer/payment-processing.queue-producer';
import { PaymentProcessingConsumer } from './src/queue/consumer/payment-processing.queue-consumer';
import { PaymentRetryConsumer } from './src/queue/consumer/payment-retry.queue-consumer';
import { ProcessPaymentUseCase } from './src/core/use-case/process-payment.use-case';
import { RetryFailedPaymentUseCase } from './src/core/use-case/retry-failed-payment.use-case';

@Module({
  imports: [
    PaymentPersistenceModule,
    QueueModule,
  ],
  providers: [
    // Domain Services
    PaymentProcessingService,
    PaymentSimulatorService,
    
    // Application Use Cases
    ProcessPaymentUseCase,
    RetryFailedPaymentUseCase,
    
    // Public API
    PaymentFacade,
    
    // Queue
    PaymentProcessingProducer,
    PaymentProcessingConsumer,
    PaymentRetryConsumer,
  ],
  controllers: [PaymentController],
  exports: [PaymentFacade, PaymentProcessingProducer],
})
export class PaymentModule {}