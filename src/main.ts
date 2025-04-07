import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn', 'debug', 'fatal', 'verbose', 'log']
        : ['error'],
  });

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Help Forum')
    .setDescription('This api is for a help forum application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
