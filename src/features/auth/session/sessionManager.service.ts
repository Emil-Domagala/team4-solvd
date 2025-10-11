import { Injectable } from '@nestjs/common';
import { Env } from 'src/common/utils/env.util';
import { RedisService } from 'src/common/utils/redis.service';

export interface SessionData {
  userId: string;
  createdAt: number;
}

@Injectable()
export class SessionManagerService {
  private readonly DEFAULT_TTL = Env.getOptionalNumber(
    'AUTH_SESSION_TTL_SEC',
    3600,
  );

  constructor(private readonly redisService: RedisService) {}

  async createSession(
    sessionId: string,
    data: SessionData,
    ttlSeconds?: number,
  ): Promise<void> {
    await this.redisService.set(
      sessionId,
      data,
      ttlSeconds ?? this.DEFAULT_TTL,
    );
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.redisService.get<SessionData>(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.del(sessionId);
  }

  async extendSession(sessionId: string, additionalTTL: number): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      await this.createSession(sessionId, session, additionalTTL);
    }
  }
}
