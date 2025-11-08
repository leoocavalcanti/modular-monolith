import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@tlc/shared-module/auth';
import { CatalogModule } from '@tlc/catalog';
import { CartPersistenceModule } from './src/persistence/cart-persistence.module';
import { CartService } from './src/core/service/cart.service';
import { CartController } from './src/http/rest/controller/cart.controller';
import { CartFacade } from './src/public-api/facade/cart.facade';
import { AddItemToCartUseCase } from './src/core/use-case/add-item-to-cart.use-case';
import { ClearCartUseCase } from './src/core/use-case/clear-cart.use-case';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CatalogModule,
    CartPersistenceModule,
  ],
  providers: [
    // Domain Services
    CartService,
    
    // Application Use Cases
    AddItemToCartUseCase,
    ClearCartUseCase,
    
    // Public API
    CartFacade,
  ],
  controllers: [CartController],
  exports: [CartFacade],
})
export class CartModule {}