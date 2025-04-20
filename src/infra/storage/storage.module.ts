import { Uploader } from '@/domain/forum/application/storage/uploader';
import { Module } from '@nestjs/common';
import { EnvModule } from '../env/env.module';
import { CloudStorage } from './cloud-storage';

@Module({
  imports: [EnvModule],
  providers: [{ provide: Uploader, useClass: CloudStorage }],
  exports: [Uploader],
})
export class StorageModule {}
