import { AuthModule } from '@/infra/auth/auth.module';
import { envSchema } from '@/infra/env/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvModule } from './env/env.module';
import { EnvService } from './env/env.service';
import { HttpModule } from './http/http.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      envFilePath:
        process.env.NODE_ENV && process.env.NODE_ENV !== 'production'
          ? `.env.${process.env.NODE_ENV}`
          : '.env',
      isGlobal: true,
    }),
    AuthModule,
    EnvModule,
    HttpModule,
  ],
  providers: [EnvService],
})
export class AppModule {}
