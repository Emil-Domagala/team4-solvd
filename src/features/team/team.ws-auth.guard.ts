import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthSessionManagerService } from 'src/common/session/authSessionManager.service';
import { Env } from 'src/common/utils/env.util';
import { parse } from 'cookie';
import { Socket } from 'socket.io';

type HandshakeAuth = Record<string, unknown>;

@Injectable()
export class TeamWsAuthGuard implements CanActivate {
  private readonly logger = new Logger(TeamWsAuthGuard.name);

  constructor(private readonly sessions: AuthSessionManagerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

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

      const currentAuth: HandshakeAuth =
        typeof client.handshake.auth === 'object' &&
        client.handshake.auth !== null
          ? (client.handshake.auth as HandshakeAuth)
          : {};

      currentAuth.userId = session.userId;
      client.handshake.auth = currentAuth;

      return true;
    } catch (error: unknown) {
      if (error instanceof Error) this.logger.warn(error.message);
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
