import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Env } from './common/utils/env.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Env.getOptionalNumber('PORT', 3000));
}
bootstrap();
