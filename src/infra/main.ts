import { AppModule } from '@/infra/app.module';
import { Env } from '@/infra/env';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? undefined : false,
  });

  app.enableCors();

  const configService = app.get<ConfigService<Env, true>>(ConfigService);

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
