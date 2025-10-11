import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Env } from './common/utils/env.util';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(Env.getOptionalNumber('PORT', 3000));
}
bootstrap();
