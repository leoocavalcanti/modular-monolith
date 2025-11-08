import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@tlc/shared-module/auth';
import { CatalogPersistenceModule } from './src/persistence/catalog-persistence.module';
import { CatalogProductService } from './src/core/service/catalog-product.service';
import { CatalogProductController } from './src/http/rest/controller/catalog-product.controller';
import { CatalogFacade } from './src/public-api/facade/catalog.facade';
import { CreateProductUseCase } from './src/core/use-case/create-product.use-case';
import { UpdateProductStockUseCase } from './src/core/use-case/update-product-stock.use-case';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    CatalogPersistenceModule,
  ],
  providers: [
    // Domain Services
    CatalogProductService,
    
    // Application Use Cases
    CreateProductUseCase,
    UpdateProductStockUseCase,
    
    // Public API
    CatalogFacade,
  ],
  controllers: [CatalogProductController],
  exports: [CatalogFacade],
})
export class CatalogModule {}