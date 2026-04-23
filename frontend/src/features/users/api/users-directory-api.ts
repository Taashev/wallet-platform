import type { UsersList } from '@/entities/user/model/user';
import type { UsersServiceHttpClient } from '@/shared/api/users-service-http-client';
import {
  normalizeUsersListResponseDto,
  type UsersListResponseDto,
} from '@/shared/api/contracts/users-service-contract';

const DEFAULT_USERS_DIRECTORY_LIMIT = 20;
const MAX_USERS_DIRECTORY_LIMIT = 40;

export type UsersDirectoryQuery = {
  offset?: number;
  limit?: number;
  username?: string;
};

export type UsersDirectoryApi = {
  getUsersDirectory(query?: UsersDirectoryQuery): Promise<UsersList>;
};

function normalizeOffset(offset?: number) {
  if (!Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(0, Math.trunc(offset ?? 0));
}

function normalizeLimit(limit?: number) {
  if (!Number.isFinite(limit)) {
    return DEFAULT_USERS_DIRECTORY_LIMIT;
  }

  return Math.min(MAX_USERS_DIRECTORY_LIMIT, Math.max(1, Math.trunc(limit ?? DEFAULT_USERS_DIRECTORY_LIMIT)));
}

function normalizeUsername(username?: string) {
  const normalizedUsername = username?.trim();

  return normalizedUsername ? normalizedUsername : undefined;
}

export function createUsersDirectoryApi(
  usersServiceHttpClient: UsersServiceHttpClient,
): UsersDirectoryApi {
  return {
    async getUsersDirectory(query = {}) {
      const response = await usersServiceHttpClient.post<UsersListResponseDto>('v1/users', {
        query: {
          offset: normalizeOffset(query.offset),
          limit: normalizeLimit(query.limit),
          username: normalizeUsername(query.username),
        },
      });

      return normalizeUsersListResponseDto(response);
    },
  };
}
