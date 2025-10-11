import { Global, Module } from '@nestjs/common';
import { CookieService } from './cookie.service';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [CookieService, RedisService],
  exports: [CookieService, RedisService],
})
export class UtilsModule {}
