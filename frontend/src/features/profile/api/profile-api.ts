import type { CurrentUserProfile } from '@/entities/user/model/user';
import type { UsersServiceHttpClient } from '@/shared/api/users-service-http-client';
import {
  normalizeCurrentUserDto,
  type ChangePasswordDto,
  type CurrentUserResponseDto,
  type UpdateUserDto,
} from '@/shared/api/contracts/users-service-contract';

export type ProfileApi = {
  getCurrentProfile(): Promise<CurrentUserProfile>;
  updateCurrentProfile(payload: UpdateUserDto): Promise<CurrentUserProfile>;
  changePassword(payload: ChangePasswordDto): Promise<void>;
  deleteCurrentProfile(): Promise<void>;
};

export function createProfileApi(
  usersServiceHttpClient: UsersServiceHttpClient,
): ProfileApi {
  return {
    async getCurrentProfile() {
      const response = await usersServiceHttpClient.get<CurrentUserResponseDto>(
        'v1/users/me',
      );

      return normalizeCurrentUserDto(response);
    },
    async updateCurrentProfile(payload) {
      const response = await usersServiceHttpClient.patch<CurrentUserResponseDto>(
        'v1/users/me',
        {
          body: payload,
        },
      );

      return normalizeCurrentUserDto(response);
    },
    async changePassword(payload) {
      await usersServiceHttpClient.patch('v1/users/me/password', {
        body: payload,
        parseAs: 'none',
      });
    },
    async deleteCurrentProfile() {
      await usersServiceHttpClient.delete('v1/users/me', {
        parseAs: 'none',
      });
    },
  };
}
