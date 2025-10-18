import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Env } from 'src/common/utils/env.util';
import { RedisService } from 'src/common/utils/redis.service';
import crypto from 'crypto';
import { UserEntity } from 'src/features/user/user.entity';

export type SessionData = {
  userId: string;
  email: string;
  sessionCreatedAt: Date;
};

@Injectable()
export class AuthSessionManagerService {
  private readonly logger = new Logger(AuthSessionManagerService.name);
  private readonly DEFAULT_TTL = Env.getOptionalNumber(
    'AUTH_SESSION_TTL_SEC',
    3600,
  );

  constructor(private readonly redisService: RedisService) {}

  async createSession(data: UserEntity, ttlSeconds?: number): Promise<string> {
    const sessionId = crypto.randomUUID();
    await this.redisService.set<SessionData>(
      sessionId,
      { userId: data.id, email: data.email, sessionCreatedAt: new Date() },
      ttlSeconds ?? this.DEFAULT_TTL,
    );
    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.redisService.get<SessionData>(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.del(sessionId);
  }

  async extendSession(
    sessionId: string,
    additionalTTL?: number,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.redisService.set(
        sessionId,
        { ...session },
        additionalTTL ?? this.DEFAULT_TTL,
      );
    }
  }

  /**
   * Verify session exists and extend TTL automatically.
   * Throws UnauthorizedException if session is invalid.
   */
  async verifyAndExtendSession(sessionId: string): Promise<SessionData> {
    const session = await this.getSession(sessionId);
    if (!session) throw new UnauthorizedException('Invalid session');

    await this.extendSession(sessionId);
    return session;
  }
}
