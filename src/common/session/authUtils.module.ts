import { Global, Module } from '@nestjs/common';
import { AuthSessionManagerService } from './authSessionManager.service';
import { AuthCookieService } from './authCookie.service';

@Global()
@Module({
  providers: [AuthSessionManagerService, AuthCookieService],
  exports: [AuthSessionManagerService, AuthCookieService],
})
export class AuthUtilsModule {}
