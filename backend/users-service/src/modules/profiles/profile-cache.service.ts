import { Inject, Injectable, Logger } from '@nestjs/common';

import { REDIS_SERVICE } from '../../infrastructure/redis/redis.keys';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { OffsetPagination } from '../../shared/pagination/offset-pagination.type';
import type { UserId } from '../users/types/user.type';

import {
  CURRENT_PROFILE_CACHE_TTL_SECONDS,
  PROFILES_LIST_CACHE_TTL_SECONDS,
} from './constants/profile.constants';
import type {
  CurrentProfileRecord,
  ProfileFilter,
  ProfilesCacheRecord,
} from './types/profile.type';

const PROFILE_CACHE_NAMESPACE = 'profiles';
const PROFILE_CACHE_VERSION = 'v1';
const CURRENT_PROFILE_CACHE_PREFIX = `${PROFILE_CACHE_NAMESPACE}:current:${PROFILE_CACHE_VERSION}`;
const PROFILES_LIST_CACHE_PREFIX = `${PROFILE_CACHE_NAMESPACE}:list:${PROFILE_CACHE_VERSION}`;

@Injectable()
export class ProfileCacheService {
  private readonly logger = new Logger(ProfileCacheService.name);

  constructor(@Inject(REDIS_SERVICE) private redisService: RedisService) {}

  async getCurrent(userId: UserId): Promise<CurrentProfileRecord | null> {
    const key = this.getCurrentProfileKey(userId);

    try {
      return await this.redisService.get<CurrentProfileRecord>(key);
    } catch (error) {
      this.logCacheError('read current profile', error);
      return null;
    }
  }

  async setCurrent(profile: CurrentProfileRecord): Promise<void> {
    const key = this.getCurrentProfileKey(profile.userId);

    try {
      await this.redisService.set(
        key,
        profile,
        CURRENT_PROFILE_CACHE_TTL_SECONDS,
      );
    } catch (error) {
      this.logCacheError('write current profile', error);
    }
  }

  /**
   * Удаляет кеш конкретного пользователя
   */
  async invalidateCurrent(userId: UserId): Promise<void> {
    const key = this.getCurrentProfileKey(userId);

    try {
      await this.redisService.delete(key);
    } catch (error) {
      this.logCacheError('delete current profile', error);
    }
  }

  async getList(
    filter: ProfileFilter,
    pagination: OffsetPagination,
  ): Promise<ProfilesCacheRecord | null> {
    const key = this.getProfilesListKey(filter, pagination);

    try {
      return await this.redisService.get<ProfilesCacheRecord>(key);
    } catch (error) {
      this.logCacheError('read profiles list', error);
      return null;
    }
  }

  async setList(
    filter: ProfileFilter,
    pagination: OffsetPagination,
    value: ProfilesCacheRecord,
  ): Promise<void> {
    const key = this.getProfilesListKey(filter, pagination);

    try {
      await this.redisService.set(key, value, PROFILES_LIST_CACHE_TTL_SECONDS);
    } catch (error) {
      this.logCacheError('write profiles list', error);
    }
  }

  /**
   * Удаляет все кешированные списки
   */
  async invalidateLists(): Promise<void> {
    try {
      await this.redisService.deleteByPattern(
        `${PROFILES_LIST_CACHE_PREFIX}:*`,
      );
    } catch (error) {
      this.logCacheError('invalidate profiles lists', error);
    }
  }

  /**
   * Это составная операция.\
   * Инвалидирует все кешированные представления указанного пользователя:\
   * его текущий профиль и все списки профилей
   */
  async invalidateUser(userId: UserId): Promise<void> {
    await Promise.all([this.invalidateCurrent(userId), this.invalidateLists()]);
  }

  private getCurrentProfileKey(userId: UserId): string {
    return `${CURRENT_PROFILE_CACHE_PREFIX}:${userId}`;
  }

  private getProfilesListKey(
    filter: ProfileFilter,
    pagination: OffsetPagination,
  ): string {
    const normalizedUsername = encodeURIComponent(
      filter.username?.trim() ?? '',
    );

    return [
      PROFILES_LIST_CACHE_PREFIX,
      `username=${normalizedUsername}`,
      `offset=${pagination.offset}`,
      `limit=${pagination.limit}`,
    ].join(':');
  }

  private logCacheError(operation: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);

    this.logger.warn(`Failed to ${operation}: ${message}`);
  }
}
