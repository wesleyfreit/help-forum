import { AppModule } from '@/infra/app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from './env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'development' ? undefined : false,
  });

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Help Forum')
    .setDescription('This api is for a help forum application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const envService = app.get(EnvService);
  const port = envService.get('PORT');

  await app.listen(port);
}

void bootstrap();
