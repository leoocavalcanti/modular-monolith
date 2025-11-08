import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '@tlc/shared-module/auth';
import { CatalogProductService } from '../../../core/service/catalog-product.service';
import { CreateProductDto } from '../dto/request/create-product.dto';
import { UpdateProductDto } from '../dto/request/update-product.dto';
import { ProductResponseDto } from '../dto/response/product.dto';
import { ProductCategory } from '../../../core/enum/product-category.enum';

@Controller('products')
export class CatalogProductController {
  constructor(
    private readonly catalogProductService: CatalogProductService
  ) {}

  @Get()
  async getProducts(@Query('category') category?: ProductCategory): Promise<ProductResponseDto[]> {
    const products = category 
      ? await this.catalogProductService.getProductsByCategory(category)
      : await this.catalogProductService.getAllProducts();

    return products.map(product =>
      plainToInstance(ProductResponseDto, product, {
        excludeExtraneousValues: true,
      })
    );
  }

  @Get('search')
  async searchProducts(@Query('q') searchTerm: string): Promise<ProductResponseDto[]> {
    const products = await this.catalogProductService.searchProducts(searchTerm);

    return products.map(product =>
      plainToInstance(ProductResponseDto, product, {
        excludeExtraneousValues: true,
      })
    );
  }

  @Get(':id')
  async getProduct(@Param('id') productId: string): Promise<ProductResponseDto> {
    const product = await this.catalogProductService.getProductById(productId);

    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.catalogProductService.createProduct(createProductDto);

    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateProduct(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    const product = await this.catalogProductService.updateProduct(productId, updateProductDto);

    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteProduct(@Param('id') productId: string): Promise<{ message: string }> {
    await this.catalogProductService.deleteProduct(productId);
    return { message: 'Product deleted successfully' };
  }
}