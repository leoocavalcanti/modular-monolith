import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@tlc/shared-module/auth';
import { ClsService } from 'nestjs-cls';
import { plainToInstance } from 'class-transformer';
import { CatalogProductService } from '../../../core/service/catalog-product.service';
import { CreateProductDto } from '../dto/request/create-product.dto';
import { UpdateProductDto } from '../dto/request/update-product.dto';
import { ProductResponseDto } from '../dto/response/product.dto';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: CatalogProductService,
    private readonly clsService: ClsService,
  ) {}

  @Get()
  async getProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productService.getAllProducts();
    return products.map(product =>
      plainToInstance(ProductResponseDto, product, {
        excludeExtraneousValues: true,
      })
    );
  }

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<ProductResponseDto> {
    const product = await this.productService.getProductById(id);
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = await this.productService.createProduct(createProductDto);
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<ProductResponseDto> {
    const product = await this.productService.updateProduct(id, updateProductDto);
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteProduct(@Param('id') id: string): Promise<{ message: string }> {
    await this.productService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}