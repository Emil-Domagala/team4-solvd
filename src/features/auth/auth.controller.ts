import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SessionManagerService } from './session/sessionManager.service';
import { AuthCookieService } from './session/authCookie.service';
import { ValidateBodyPipe } from 'src/common/utils/validateBody.pipe';
import * as createUserDto from '../user/dto/createUser.dto';
import { UserLoginError } from './error/userLogin.error';
import { Env } from 'src/common/utils/env.util';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionManager: SessionManagerService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  async register(
    @Body(new ValidateBodyPipe(createUserDto.CreateUserSchema))
    dto: createUserDto.CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(dto);

    const sessionId = await this.sessionManager.createSession({
      userId: user.id,
      createdAt: Date.now(),
    });

    this.authCookieService.setAuthSessionCookie(res, sessionId);

    return { success: true, userId: user.id };
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UserLoginError();

    const sessionId = await this.sessionManager.createSession({
      userId: user.id,
      createdAt: Date.now(),
    });

    this.authCookieService.setAuthSessionCookie(res, sessionId);

    return { userId: user.id };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    // Read session token from the auth cookie
    const sessionId = req.cookies[Env.getString('AUTH_SESSION_COOKIE_NAME')] as
      | string
      | undefined;

    if (sessionId) {
      await this.sessionManager.deleteSession(sessionId);
    }

    // Clear the auth cookie
    this.authCookieService.clearAuthSessionCookie(res);
    return { success: true };
  }
}
