import type { AuthSession } from '@/entities/auth/model/auth-session';
import type {
  CurrentUserProfile,
  PublicUser,
  UsersList,
} from '@/entities/user/model/user';

export type CreateUserDto = {
  username: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  about?: string;
};

export type AuthLocalDto = {
  username: string;
  password: string;
};

export type RefreshTokenDto = {
  refreshToken: string;
};

export type UpdateUserDto = {
  username?: string;
  email?: string;
  dateOfBirth?: string;
  about?: string;
};

export type ChangePasswordDto = {
  oldPassword: string;
  newPassword: string;
};

export type AuthTokensDto = {
  accessToken: string;
  refreshToken: string;
};

export type CurrentUserResponseDto = {
  userId: string;
  username: string;
  email: string;
  about?: string | null;
  dateOfBirth?: string | null;
  age?: number | string | null;
};

export type PublicUserDto = {
  userId: string;
  username: string;
  about?: string | null;
  dateOfBirth?: string | null;
  age?: number | string | null;
};

export type UsersListResponseDto = {
  users: PublicUserDto[];
  total: number;
};

function normalizeRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== 'string') {
    throw new Error(`Expected "${fieldName}" to be a string.`);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(`Expected "${fieldName}" to be a non-empty string.`);
  }

  return normalizedValue;
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

function normalizeOptionalDate(value: unknown) {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue) ? normalizedValue : null;
}

function normalizeOptionalAge(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    const parsedValue = Number(normalizedValue);

    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return Math.trunc(parsedValue);
    }
  }

  return null;
}

function normalizeTotal(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.trunc(value);
  }

  return 0;
}

export function normalizeAuthTokensDto(dto: AuthTokensDto): AuthSession {
  return {
    accessToken: normalizeRequiredString(dto.accessToken, 'accessToken'),
    refreshToken: normalizeRequiredString(dto.refreshToken, 'refreshToken'),
  };
}

export function normalizeCurrentUserDto(
  dto: CurrentUserResponseDto,
): CurrentUserProfile {
  return {
    id: normalizeRequiredString(dto.userId, 'userId'),
    username: normalizeRequiredString(dto.username, 'username'),
    email: normalizeRequiredString(dto.email, 'email'),
    about: normalizeOptionalString(dto.about),
    dateOfBirth: normalizeOptionalDate(dto.dateOfBirth),
    age: normalizeOptionalAge(dto.age),
  };
}

export function normalizePublicUserDto(dto: PublicUserDto): PublicUser {
  return {
    id: normalizeRequiredString(dto.userId, 'userId'),
    username: normalizeRequiredString(dto.username, 'username'),
    about: normalizeOptionalString(dto.about),
    dateOfBirth: normalizeOptionalDate(dto.dateOfBirth),
    age: normalizeOptionalAge(dto.age),
  };
}

export function normalizeUsersListResponseDto(
  dto: UsersListResponseDto,
): UsersList {
  return {
    users: Array.isArray(dto.users)
      ? dto.users.map((user) => normalizePublicUserDto(user))
      : [],
    total: normalizeTotal(dto.total),
  };
}
