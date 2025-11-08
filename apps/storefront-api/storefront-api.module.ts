import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogModule } from '@tlc/catalog';
import { CartModule } from '@tlc/cart';
import { OrderModule } from '@tlc/order';
import { IdentityModule } from '@tlc/identity';
import { storefrontConfig, catalogConfig, cartConfig, orderConfig } from './config';

@Module({
  imports: [
    CatalogModule,
    CartModule,
    OrderModule,
    IdentityModule,
    ConfigModule.forRoot({
      load: [storefrontConfig, catalogConfig, cartConfig, orderConfig],
    }),
  ],
})
export class StorefrontApiModule {}