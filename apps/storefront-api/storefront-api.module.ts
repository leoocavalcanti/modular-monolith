import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@tlc/shared-module/logger';
import { CatalogModule } from '@tlc/catalog';
import { CartModule } from '@tlc/cart';
import { OrderModule } from '@tlc/order';
import { IdentityModule } from '@tlc/identity';
import { storefrontConfig, catalogConfig, cartConfig, orderConfig, identityConfig } from './config';

@Module({
  imports: [
    LoggerModule,
    CatalogModule,
    CartModule,
    OrderModule,
    IdentityModule,
    ConfigModule.forRoot({
      load: [storefrontConfig, catalogConfig, cartConfig, orderConfig, identityConfig],
      isGlobal: true,
    }),
  ],
})
export class StorefrontApiModule {}