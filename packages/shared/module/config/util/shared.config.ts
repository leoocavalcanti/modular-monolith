import { ConfigException } from './config.exception';
import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const sharedConfigSchema = z.object({
  env: environmentSchema,
  billingApi: z.object({
    url: z.string(),
  }),
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(6379),
  }),
});

export type Environment = z.infer<typeof environmentSchema>;

export type SharedConfig = z.infer<typeof sharedConfigSchema>;

export const sharedConfigFactory = (): SharedConfig => {
  const result = sharedConfigSchema.safeParse({
    env: process.env.NODE_ENV,
    billingApi: {
      url: process.env.BILLING_API_URL,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(`Invalid application configuration: ${result.error.message}`);
};
