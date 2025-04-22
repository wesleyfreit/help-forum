import { DomainEvents } from '@/core/events/domain-events';
import { envSchema } from '@/infra/env/env';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { Redis } from 'ioredis';
import { createBucket } from 'scripts/create-bucket';

config({ path: '.env.test', override: true });

const env = envSchema.parse(process.env);

const prisma = new PrismaClient();

const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  db: Number(env.REDIS_DB),
});

const schema = randomUUID();

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.');
  }

  const url = new URL(env.DATABASE_URL);

  url.searchParams.set('schema', schemaId);

  return url.toString();
}

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schema);

  process.env.DATABASE_URL = databaseURL;

  execSync('pnpm prisma migrate deploy');

  DomainEvents.shouldRun = false;

  await redis.flushdb();

  void createBucket();
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await prisma.$disconnect();
});
