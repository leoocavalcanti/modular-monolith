import { Controller, Get } from '@nestjs/common';

@Controller()
export class ProductController {
  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('products')
  getProducts() {
    return [];
  }
}