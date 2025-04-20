import { envSchema } from '@/infra/env/env';
import {
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutBucketCorsCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from 'dotenv';

const envPath =
  process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
    ? `.env.${process.env.NODE_ENV}`
    : '.env';

config({ path: envPath, override: true });

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());

  throw new Error('Invalid environment variables');
}

const env = _env.data;

const client = new S3Client({
  region: env.BUCKET_REGION,
  endpoint: env.BUCKET_ENDPOINT,
  forcePathStyle: env.NODE_ENV !== 'production',
});

export async function createBucket() {
  try {
    await client.send(
      new CreateBucketCommand({
        Bucket: env.BUCKET_NAME,
      }),
    );

    const corsConfiguration: PutBucketCorsCommandInput = {
      Bucket: env.BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT'],
            AllowedOrigins: [env.ORIGIN_URL],
            ExposeHeaders: [],
          },
        ],
      },
    };

    await client.send(new PutBucketCorsCommand(corsConfiguration));
  } catch (error) {
    console.error('Error creating bucket or setting CORS:', error);
  }
}

void createBucket();
