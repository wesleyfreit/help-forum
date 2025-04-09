import { CreateAccountController } from '@/controllers/create-account.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { envSchema } from './env';

@Module({
  imports: [
    ConfigModule.forRoot({
      // validationSchema: envSchema,
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [CreateAccountController],
  providers: [PrismaService],
})
export class AppModule {}
