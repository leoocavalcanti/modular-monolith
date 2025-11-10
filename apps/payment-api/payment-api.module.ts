import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@tlc/shared-module/logger';
import { PaymentModule } from '@tlc/payment';
import { paymentConfig } from './config';

@Module({
  imports: [
    LoggerModule,
    PaymentModule,
    ConfigModule.forRoot({
      load: [paymentConfig],
      isGlobal: true,
    }),
  ],
})
export class PaymentApiModule {}