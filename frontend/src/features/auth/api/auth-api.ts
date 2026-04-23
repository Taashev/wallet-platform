import type { AuthSession } from '@/entities/auth/model/auth-session';
import type { UsersServiceHttpClient } from '@/shared/api/users-service-http-client';
import {
  normalizeAuthTokensDto,
  type AuthLocalDto,
  type AuthTokensDto,
  type CreateUserDto,
  type RefreshTokenDto,
} from '@/shared/api/contracts/users-service-contract';

export type AuthApi = {
  signup(payload: CreateUserDto): Promise<AuthSession>;
  signin(payload: AuthLocalDto): Promise<AuthSession>;
  refresh(payload: RefreshTokenDto): Promise<AuthSession>;
  signout(): Promise<void>;
};

export function createAuthApi(
  usersServiceHttpClient: UsersServiceHttpClient,
): AuthApi {
  return {
    async signup(payload) {
      const response = await usersServiceHttpClient.post<AuthTokensDto>(
        'v1/auth/signup',
        {
          body: payload,
        },
      );

      return normalizeAuthTokensDto(response);
    },
    async signin(payload) {
      const response = await usersServiceHttpClient.post<AuthTokensDto>(
        'v1/auth/signin',
        {
          body: payload,
        },
      );

      return normalizeAuthTokensDto(response);
    },
    async refresh(payload) {
      const response = await usersServiceHttpClient.post<AuthTokensDto>(
        'v1/auth/refresh',
        {
          body: payload,
        },
      );

      return normalizeAuthTokensDto(response);
    },
    async signout() {
      await usersServiceHttpClient.post('v1/auth/signout', {
        parseAs: 'none',
      });
    },
  };
}
