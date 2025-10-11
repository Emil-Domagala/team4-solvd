import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Env } from 'src/common/utils/env.util';

@Injectable()
export class CookieService {
  protected readonly baseCookieOptions = {
    domain: Env.getString('FRONTEND_DOMAIN'),
    secure: Env.getString('NODE_ENV') === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  };

  public setCookie = (
    res: Response,
    name: string,
    value: string,
    path: string,
    maxAgeSec: number,
  ): void => {
    res.cookie(name, value, {
      ...this.baseCookieOptions,
      maxAge: maxAgeSec * 1000,
      path,
    });
  };

  public clearCookie = (res: Response, name: string, path = '/'): void => {
    res.clearCookie(name, { path, domain: this.baseCookieOptions.domain });
  };
}
