import { Controller, Post, Res } from '@nestjs/common';
import { SessionManagerService } from './session/sessionManager.service';
import { AuthCookieService } from './session/authCookie.service';
import type { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly sessionManager: SessionManagerService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('login')
  async login(@Res({ passthrough: true }) res: Response) {
    const sessionId = crypto.randomUUID();
    await this.sessionManager.createSession(sessionId, {
      userId: '123',
      createdAt: Date.now(),
    });

    this.authCookieService.setAuthSessionCookie(res, sessionId);
    // TODO: Implement login logic, password checking etc
    return { success: true };
  }

  // TODO: implement this
  //   @Post('logout')
  //   async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
  // const sessionId = req.cookies?.SESSION_ID;
  // if (sessionId) await this.sessionManager.deleteSession(sessionId);
  // this.authCookieService.clearAuthSessionCookie(res);
  //   }
}
