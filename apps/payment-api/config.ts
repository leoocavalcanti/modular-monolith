import { registerAs } from '@nestjs/config';

export const paymentConfig = registerAs('payment', () => ({
  port: process.env.PAYMENT_PORT || 3002,
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.PAYMENT_DB_HOST || 'localhost',
    port: parseInt(process.env.PAYMENT_DB_PORT) || 5432,
    username: process.env.PAYMENT_DB_USERNAME || 'postgres',
    password: process.env.PAYMENT_DB_PASSWORD || 'postgres',
    database: process.env.PAYMENT_DB_DATABASE || 'ecommerce_payment',
  },
  webhook: {
    secret: process.env.PAYMENT_WEBHOOK_SECRET || 'webhook-secret-key',
  },
}));