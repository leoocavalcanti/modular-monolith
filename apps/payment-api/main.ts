import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { PaymentApiModule } from './payment-api.module';

async function bootstrap() {
  const app = await NestFactory.create(PaymentApiModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.PAYMENT_PORT || 3002;
  await app.listen(port);
  
  Logger.log(`🚀 Payment API is running on: http://localhost:${port}`, 'Bootstrap');
}

bootstrap();