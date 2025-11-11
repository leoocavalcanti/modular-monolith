import { registerAs } from '@nestjs/config';

export const adminConfig = registerAs('admin', () => ({
  port: process.env.ADMIN_PORT || 3001,
  environment: process.env.NODE_ENV || 'development',
}));

export const catalogConfig = registerAs('catalog', () => ({
  database: {
    host: process.env.CATALOG_DB_HOST || 'localhost',
    port: parseInt(process.env.CATALOG_DB_PORT || '5432'),
    username: process.env.CATALOG_DB_USERNAME || 'postgres',
    password: process.env.CATALOG_DB_PASSWORD || 'postgres',
    database: process.env.CATALOG_DB_DATABASE || 'ecommerce_catalog',
  },
}));

export const orderConfig = registerAs('order', () => ({
  database: {
    host: process.env.ORDER_DB_HOST || 'localhost',
    port: parseInt(process.env.ORDER_DB_PORT || '5432'),
    username: process.env.ORDER_DB_USERNAME || 'postgres',
    password: process.env.ORDER_DB_PASSWORD || 'postgres',
    database: process.env.ORDER_DB_DATABASE || 'ecommerce_order',
  },
  paymentApi: {
    url: process.env.PAYMENT_API_URL || 'http://payment-api:3002',
  },
}));

export const paymentConfig = registerAs('payment', () => ({
  database: {
    host: process.env.PAYMENT_DB_HOST || 'localhost',
    port: parseInt(process.env.PAYMENT_DB_PORT || '5432'),
    username: process.env.PAYMENT_DB_USERNAME || 'postgres',
    password: process.env.PAYMENT_DB_PASSWORD || 'postgres',
    database: process.env.PAYMENT_DB_DATABASE || 'ecommerce_payment',
  },
}));

export const cartConfig = registerAs('cart', () => ({
  database: {
    host: process.env.CART_DB_HOST || 'localhost',
    port: parseInt(process.env.CART_DB_PORT || '5432'),
    username: process.env.CART_DB_USERNAME || 'postgres',
    password: process.env.CART_DB_PASSWORD || 'postgres',
    database: process.env.CART_DB_DATABASE || 'ecommerce_cart',
  },
}));

export const identityConfig = registerAs('identity', () => ({
  database: {
    host: process.env.IDENTITY_DB_HOST || 'localhost',
    port: parseInt(process.env.IDENTITY_DB_PORT || '5433'),
    username: process.env.IDENTITY_DB_USERNAME || 'postgres',
    password: process.env.IDENTITY_DB_PASSWORD || 'postgres',
    database: process.env.IDENTITY_DB_DATABASE || 'ecommerce_identity',
  },
}));