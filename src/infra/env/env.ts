import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  PORT: z.coerce.number().optional().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  BUCKET_ENDPOINT: z.string(),
  BUCKET_NAME: z.string(),
  BUCKET_REGION: z.string().default('us-east-1'),
  BUCKET_ACCESS_KEY_ID: z.string(),
  BUCKET_SECRET_ACCESS_KEY: z.string(),
  ORIGIN_URL: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_DB: z.coerce.number().default(0),
});

export type Env = z.infer<typeof envSchema>;
