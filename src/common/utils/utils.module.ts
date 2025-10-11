import { Global, Module } from '@nestjs/common';
import { CookieService } from './cookie.service';
import { RedisService } from './redis.service';
import { PasswordService } from './password.service';

@Global()
@Module({
  providers: [CookieService, RedisService, PasswordService],
  exports: [CookieService, RedisService, PasswordService],
})
export class UtilsModule {}
