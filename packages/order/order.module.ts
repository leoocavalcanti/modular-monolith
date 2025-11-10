import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@tlc/shared-module/auth';
import { HttpClientModule } from '@tlc/shared-module/http-client';
import { QueueModule } from '@tlc/shared-module/queue';
import { CartModule } from '@tlc/cart';
import { OrderPersistenceModule } from './src/persistence/order-persistence.module';
import { OrderService } from './src/core/service/order.service';
import { OrderController } from './src/http/rest/controller/order.controller';
import { OrderFacade } from './src/public-api/facade/order.facade';
import { PaymentApiClient } from './src/http/client/payment-api.client';
import { OrderFulfillmentProducer } from './src/queue/producer/order-fulfillment.queue-producer';
import { OrderFulfillmentConsumer } from './src/queue/consumer/order-fulfillment.queue-consumer';
import { CreateOrderFromCartUseCase } from './src/core/use-case/create-order-from-cart.use-case';
import { UpdateOrderStatusUseCase } from './src/core/use-case/update-order-status.use-case';

@Module({
  imports: [
    AuthModule,
    HttpClientModule,
    QueueModule,
    CartModule,
    OrderPersistenceModule,
  ],
  providers: [
    // Domain Services
    OrderService,
    
    // Application Use Cases
    CreateOrderFromCartUseCase,
    UpdateOrderStatusUseCase,
    
    // HTTP Clients
    PaymentApiClient,
    
    // Public API
    OrderFacade,
    
    // Queue
    OrderFulfillmentProducer,
    OrderFulfillmentConsumer,
  ],
  controllers: [OrderController],
  exports: [OrderFacade, OrderFulfillmentProducer],
})
export class OrderModule {}