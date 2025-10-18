import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    //@ts-expect-error it works like that
    await this.cacheManager.set(key, JSON.stringify(value), {
      ttl: ttlSeconds,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.cacheManager.get<string>(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }
}
