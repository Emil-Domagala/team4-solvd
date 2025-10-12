import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { CookieService } from 'src/common/utils/cookie.service';
import { Env } from 'src/common/utils/env.util';

@Injectable()
export class AuthCookieService extends CookieService {
  private readonly authSessionCookieName = Env.getString(
    'AUTH_SESSION_COOKIE_NAME',
  );
  private readonly sessionTtlSec = Env.getNumber('AUTH_SESSION_TTL_SEC');

  public setAuthSessionCookie = (res: Response, token: string): void => {
    this.setCookie(
      res,
      this.authSessionCookieName,
      token,
      '/',
      this.sessionTtlSec,
    );
  };

  public clearAuthSessionCookie = (res: Response): void => {
    this.clearCookie(res, this.authSessionCookieName, '/');
  };
}
