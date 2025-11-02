import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  AuthSessionManagerService,
  SessionData,
} from 'src/common/session/authSessionManager.service';
import { Env } from 'src/common/utils/env.util';
import { parse } from 'cookie';
import { Socket as BaseSocket } from 'socket.io';

interface AuthedSocket extends BaseSocket {
  data: {
    user?: SessionData;
  };
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly sessions: AuthSessionManagerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthedSocket>();

    const rawCookieHeader =
      client.handshake?.headers?.cookie ?? client.handshake?.headers?.Cookie;

    if (!rawCookieHeader) {
      throw new UnauthorizedException('Missing cookie header');
    }

    const cookieHeader: string = Array.isArray(rawCookieHeader)
      ? rawCookieHeader.join('; ')
      : rawCookieHeader;

    let parsedCookies: Record<string, string>;
    try {
      if (typeof cookieHeader !== 'string') {
        throw new Error('Cookie header must be a string');
      }
      parsedCookies = (
        parse as unknown as (cookie: string) => Record<string, string>
      )(cookieHeader);
    } catch {
      throw new UnauthorizedException('Invalid cookie format');
    }

    const cookieName = Env.getString('AUTH_SESSION_COOKIE_NAME');
    const sessionId = parsedCookies[cookieName];

    if (!sessionId || typeof sessionId !== 'string') {
      throw new UnauthorizedException('Invalid session token');
    }

    try {
      const session = await this.sessions.verifyAndExtendSession(sessionId);
      client.data.user = session;
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) this.logger.warn(error.message);
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
