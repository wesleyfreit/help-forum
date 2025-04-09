import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Env } from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [],
  });

  app.enableCors();

  const configService = app.get<ConfigService<Env, true>>(ConfigService);

  const env = configService.get('NODE_ENV', { infer: true });

  if (env === 'development') {
    app.useLogger(['error', 'warn', 'debug', 'verbose']);
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Help Forum')
    .setDescription('This api is for a help forum application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('docs', app, documentFactory);

  const port = configService.get('PORT', { infer: true });

  await app.listen(port);
}

void bootstrap();
