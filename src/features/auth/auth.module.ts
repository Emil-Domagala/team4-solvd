import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './session/authCookie.service';
import { SessionManagerService } from './session/sessionManager.service';

@Module({
  controllers: [AuthController],
  providers: [SessionManagerService, AuthCookieService],
  exports: [SessionManagerService, AuthCookieService],
})
export class AuthModule {}
