import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthCookieService } from './session/authCookie.service';
import { SessionManagerService } from './session/sessionManager.service';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [SessionManagerService, AuthCookieService, AuthService],
  exports: [SessionManagerService, AuthCookieService, AuthService],
})
export class AuthModule {}
