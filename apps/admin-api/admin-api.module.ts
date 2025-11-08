import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from '@tlc/catalog';
import { OrderModule } from '@tlc/order';
import { PaymentModule } from '@tlc/payment';
import { IdentityModule } from '@tlc/identity';
import { adminConfig, catalogConfig, orderConfig, paymentConfig } from './config';

@Module({
  imports: [
    CatalogModule,
    OrderModule,
    PaymentModule,
    IdentityModule,
    ConfigModule.forRoot({
      load: [adminConfig, catalogConfig, orderConfig, paymentConfig],
    }),
  ],
})
export class AdminApiModule {}