import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { Env } from 'src/common/utils/env.util';
import { RedisService } from 'src/common/utils/redis.service';
import { UserEntity } from 'src/features/user/user.entity';

export type SessionData = {
  userId: string;
  email: string;
  role: {
    name: string;
    priority: number;
  };
  sessionCreatedAt: Date;
};

@Injectable()
export class AuthSessionManagerService extends RedisService {
  private readonly logger = new Logger(AuthSessionManagerService.name);
  private readonly SESSION_PREFIX = 'session:';
  private readonly DEFAULT_TTL = Env.getOptionalNumber(
    'AUTH_SESSION_TTL_SEC',
    3600,
  );

  private getSessionKey(sessionId: string) {
    return `${this.SESSION_PREFIX}${sessionId}`;
  }

  async createSession(data: UserEntity, ttlSeconds?: number): Promise<string> {
    const sessionId = crypto.randomUUID();
    const key = this.getSessionKey(sessionId);
    const value: SessionData = {
      userId: data.id,
      email: data.email,
      role: {
        name: data.role.name,
        priority: data.role.priority,
      },
      sessionCreatedAt: new Date(),
    };

    await this.getClient().set(
      key,
      JSON.stringify(value),
      'EX',
      ttlSeconds ?? this.DEFAULT_TTL,
    );
    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const json = await this.getClient().get(this.getSessionKey(sessionId));
    if (!json) return null;

    try {
      return JSON.parse(json) as SessionData;
    } catch (err) {
      this.logger.debug('Error parsing session JSON', err);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.getClient().del(this.getSessionKey(sessionId));
  }

  async extendSession(
    sessionId: string,
    additionalTTL?: number,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const session = await this.getSession(sessionId);
    if (session) {
      await this.getClient().set(
        key,
        JSON.stringify(session),
        'EX',
        additionalTTL ?? this.DEFAULT_TTL,
      );
    }
  }

  async verifyAndExtendSession(sessionId: string): Promise<SessionData> {
    const session = await this.getSession(sessionId);
    if (!session) throw new UnauthorizedException('Invalid session');

    await this.extendSession(sessionId);
    return session;
  }
}

