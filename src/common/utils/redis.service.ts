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
}
