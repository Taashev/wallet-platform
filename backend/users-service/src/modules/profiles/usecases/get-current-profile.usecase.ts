import { Inject, Injectable } from '@nestjs/common';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { NotFoundError } from '../../../shared/errors';
import { calculateAge } from '../../users/domain/calculate-age';
import { UserId } from '../../users/types/user.type';
import { PROFILE_AVATAR_URL_EXPIRES_IN_SECONDS } from '../constants/profile.constants';
import { PROFILE_QUERY_REPOSITORY } from '../constants/profile.keys';
import type { ProfileQueryRepository } from '../interfaces/profile-query-repository.interface';
import type {
  CurrentProfileView,
  ProfileViewAvatar,
} from '../types/profile.type';

@Injectable()
export class GetCurrentProfileUseCase {
  constructor(
    @Inject(PROFILE_QUERY_REPOSITORY)
    private profileQueryRepository: ProfileQueryRepository,
    @Inject(FILE_STORAGE_SERVICE)
    private fileStorageService: IFileStorageService,
  ) {}

  async execute(userId: UserId): Promise<CurrentProfileView> {
    const profile =
      await this.profileQueryRepository.getProfileByUserId(userId);

    if (!profile) {
      throw new NotFoundError({
        message:
          'Access token успешно провалидирован, но пользователь не найден',
        safeMessage: ERROR_MESSAGES.USER_NOT_FOUND,
        expose: true,
      });
    }

    let avatar: ProfileViewAvatar = null;

    if (profile.avatar !== null) {
      const url = await this.fileStorageService.getPresignedDownloadUrl(
        profile.avatar.storageKey,
        {
          expiresInSeconds: PROFILE_AVATAR_URL_EXPIRES_IN_SECONDS,
        },
      );

      avatar = {
        avatarId: profile.avatar.avatarId,
        url,
      };
    }

    return {
      userId: profile.userId,
      username: profile.username,
      email: profile.email,
      dateOfBirth: profile.dateOfBirth,
      about: profile.about,
      age: calculateAge(profile.dateOfBirth),
      avatar,
    };
  }
}
