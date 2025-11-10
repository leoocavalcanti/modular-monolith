import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@tlc/shared-module/logger';
import { CatalogModule } from '@tlc/catalog';
import { OrderModule } from '@tlc/order';
import { PaymentModule } from '@tlc/payment';
// import { IdentityModule } from '@tlc/identity';
import { adminConfig, catalogConfig, orderConfig, paymentConfig, cartConfig, identityConfig } from './config';

@Module({
  imports: [
    LoggerModule,
    CatalogModule,
    OrderModule,
    PaymentModule,
    // IdentityModule,
    ConfigModule.forRoot({
      load: [adminConfig, catalogConfig, orderConfig, paymentConfig, cartConfig, identityConfig],
      isGlobal: true,
    }),
  ],
})
export class AdminApiModule {}