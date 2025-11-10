import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { StorefrontApiModule } from './storefront-api.module';

async function bootstrap() {
  // Initialize transactional context before creating the app
  initializeTransactionalContext();
  
  const app = await NestFactory.create(StorefrontApiModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.STOREFRONT_PORT || 3000;
  await app.listen(port);
  
  Logger.log(`🚀 Storefront API is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();