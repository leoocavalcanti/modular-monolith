import { registerAs } from '@nestjs/config';

export const storefrontConfig = registerAs('storefront', () => ({
  port: process.env.STOREFRONT_PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
}));

export const catalogConfig = registerAs('catalog', () => ({
  database: {
    host: process.env.CATALOG_DB_HOST || 'localhost',
    port: parseInt(process.env.CATALOG_DB_PORT || '5433'),
    username: process.env.CATALOG_DB_USERNAME || 'postgres',
    password: process.env.CATALOG_DB_PASSWORD || 'postgres',
    database: process.env.CATALOG_DB_DATABASE || 'ecommerce_catalog_db',
  },
}));

export const cartConfig = registerAs('cart', () => ({
  database: {
    host: process.env.CART_DB_HOST || 'localhost',
    port: parseInt(process.env.CART_DB_PORT || '5433'),
    username: process.env.CART_DB_USERNAME || 'postgres',
    password: process.env.CART_DB_PASSWORD || 'postgres',
    database: process.env.CART_DB_DATABASE || 'ecommerce_cart_db',
  },
}));

export const orderConfig = registerAs('order', () => ({
  database: {
    host: process.env.ORDER_DB_HOST || 'localhost',
    port: parseInt(process.env.ORDER_DB_PORT || '5433'),
    username: process.env.ORDER_DB_USERNAME || 'postgres',
    password: process.env.ORDER_DB_PASSWORD || 'postgres',
    database: process.env.ORDER_DB_DATABASE || 'ecommerce_order_db',
  },
  paymentApi: {
    url: process.env.PAYMENT_API_URL || 'http://payment-api:3002',
  },
}));

export const identityConfig = registerAs('identity', () => ({
  database: {
    host: process.env.IDENTITY_DB_HOST || 'localhost',
    port: parseInt(process.env.IDENTITY_DB_PORT || '5433'),
    username: process.env.IDENTITY_DB_USERNAME || 'postgres',
    password: process.env.IDENTITY_DB_PASSWORD || 'postgres',
    database: process.env.IDENTITY_DB_DATABASE || 'ecommerce_identity_db',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-for-development',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}));
