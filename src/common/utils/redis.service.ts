import Redis from 'ioredis';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Env } from './env.util';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: Env.getString('REDIS_HOST'),
      port: Env.getNumber('REDIS_PORT'),
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  getClient() {
    return this.client;
  }

  async saveTeamMessage(
    roomId: string,
    teamId: string,
    message: {
      playerId: string;
      username: string;
      text: string;
      timestamp: string;
    },
  ) {
    const key = `room:${roomId}:team:${teamId}:chat`;
    await this.getClient().lpush(key, JSON.stringify(message));
    await this.getClient().ltrim(key, 0, 49); // max 50 ostatnich wiadomości
  }

  async getTeamMessages<T = any>(roomId: string, teamId: string): Promise<T[]> {
    const key = `room:${roomId}:team:${teamId}:chat`;
    const messages = await this.getClient().lrange(key, 0, -1);
    return messages.map((msg) => JSON.parse(msg) as T);
  }
}
