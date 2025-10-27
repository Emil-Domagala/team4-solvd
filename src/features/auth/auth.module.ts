import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthCookieService } from '../../common/session/authCookie.service';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../user/role/role.module';

@Module({
  imports: [UserModule, RoleModule],
  controllers: [AuthController],
  providers: [AuthCookieService, AuthService],
  exports: [AuthCookieService, AuthService],
})
export class AuthModule {}
