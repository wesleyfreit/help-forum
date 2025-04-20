import { Uploader, UploadParams } from '@/domain/forum/application/storage/uploader';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EnvService } from '../env/env.service';

@Injectable()
export class CloudStorage implements Uploader {
  private client: S3Client;

  constructor(private envService: EnvService) {
    this.client = new S3Client({
      region: envService.get('BUCKET_REGION'),
      endpoint: envService.get('BUCKET_ENDPOINT'),
      credentials: {
        accessKeyId: envService.get('BUCKET_ACCESS_KEY_ID'),
        secretAccessKey: envService.get('BUCKET_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: envService.get('NODE_ENV') !== 'production',
    });
  }

  async upload({ fileName, fileType, body }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID();
    const uniqueFileName = `${uploadId}-${fileName}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get('BUCKET_NAME'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    );

    return {
      url: uniqueFileName,
    };
  }
}
