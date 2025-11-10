import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AdminApiModule } from './admin-api.module';

async function bootstrap() {
  // Initialize transactional context before creating the app
  initializeTransactionalContext();
  
  const app = await NestFactory.create(AdminApiModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.ADMIN_PORT || 3001;
  await app.listen(port);
  
  Logger.log(`🚀 Admin API is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();