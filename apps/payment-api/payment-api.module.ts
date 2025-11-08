import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentModule } from '@tlc/payment';
import { paymentConfig } from './config';

@Module({
  imports: [
    PaymentModule,
    ConfigModule.forRoot({
      load: [paymentConfig],
    }),
  ],
})
export class PaymentApiModule {}