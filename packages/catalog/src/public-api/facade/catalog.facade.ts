import { Injectable } from '@nestjs/common';
import { CatalogProductService } from '../../core/service/catalog-product.service';
import { CatalogProduct } from '../../persistence/entity/catalog-product.entity';

export interface CatalogProductAvailabilityApi {
  checkProductAvailability(productId: string, quantity: number): Promise<boolean>;
  getProductById(productId: string): Promise<CatalogProduct>;
  updateStock(productId: string, newStock: number): Promise<CatalogProduct>;
}

@Injectable()
export class CatalogFacade implements CatalogProductAvailabilityApi {
  constructor(private readonly catalogProductService: CatalogProductService) {}

  async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    return this.catalogProductService.checkProductAvailability(productId, quantity);
  }

  async getProductById(productId: string): Promise<CatalogProduct> {
    return this.catalogProductService.getProductById(productId);
  }

  async updateStock(productId: string, newStock: number): Promise<CatalogProduct> {
    return this.catalogProductService.updateStock(productId, newStock);
  }
}