import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ClientApiModule } from './client-api.module';

async function bootstrap() {
  // Initialize transactional context before creating the app
  initializeTransactionalContext();
  
  const app = await NestFactory.create(ClientApiModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.CLIENT_PORT || 3000;
  await app.listen(port);
  
  Logger.log(`🚀 Client API is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();