import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  SessionData,
  AuthSessionManagerService,
} from 'src/common/session/authSessionManager.service';
import { Env } from '../utils/env.util';
import { SessionInvalidError } from '../errors/sessionInvalid.error';

export interface AuthRequest extends Request {
  user?: SessionData;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionManager: AuthSessionManagerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    console.log(req.cookies);
    const token = req.cookies[
      Env.getString('AUTH_SESSION_COOKIE_NAME')
    ] as string;

    console.log('token: ', token);

    if (!token) throw new SessionInvalidError();

    try {
      const sessionData =
        await this.sessionManager.verifyAndExtendSession(token);

      console.log(sessionData);

      req.user = sessionData;

      return true;
    } catch (err: unknown) {
      console.warn(err);
      throw new UnauthorizedException('Invalid session');
    }
  }
}
