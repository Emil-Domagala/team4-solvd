import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Env } from './common/utils/env.util';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomExceptionFilter } from './common/filters/customException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove extra fields
      forbidNonWhitelisted: true, // throw on unknown fields
      transform: true, // automatically transform payloads to DTO instances
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.use(cookieParser());
  await app.listen(Env.getOptionalNumber('PORT', 3000));
}
bootstrap();
