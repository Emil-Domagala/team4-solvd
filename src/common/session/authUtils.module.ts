import { Module } from '@nestjs/common';
import { AuthSessionManagerService } from './authSessionManager.service';
import { AuthCookieService } from './authCookie.service';

@Module({
  providers: [AuthSessionManagerService, AuthCookieService],
  exports: [AuthSessionManagerService, AuthCookieService],
})
export class AuthUtilsModule {}
