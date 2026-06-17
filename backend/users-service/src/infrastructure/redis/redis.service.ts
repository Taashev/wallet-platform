import { Inject, OnModuleDestroy } from '@nestjs/common';

import Redis from 'ioredis';

import { REDIS_CLIENT } from './redis.keys';

export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    if (value === null || value === undefined) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const serialized = JSON.stringify(value);

    let result: string | null;

    if (ttl) {
      result = await this.redis.set(key, serialized, 'EX', ttl);
    } else {
      result = await this.redis.set(key, serialized);
    }

    return result === 'OK';
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.redis.del(key);
    return result > 0;
  }

  async deleteByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deleted = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        const result = await this.redis.unlink(...keys);
        deleted += result;
      }
    } while (cursor !== '0');

    return deleted;
  }
}
