import { Inject, Injectable } from '@nestjs/common';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';
import { PAGINATION_LIMIT_DEFAULT } from '../../../shared/pagination/constants';
import { normalizeOffsetPagination } from '../../../shared/pagination/notmalize-offset-pagination';
import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { calculateAge } from '../../users/domain/calculate-age';
import { PROFILE_AVATAR_URL_EXPIRES_IN_SECONDS } from '../constants/profile.constants';
import { PROFILE_QUERY_REPOSITORY } from '../constants/profile.keys';
import type { ProfileQueryRepository } from '../interfaces/profile-query-repository.interface';
import type {
  ProfileFilter,
  ProfileRecord,
  ProfileView,
  ProfileViewAvatar,
} from '../types/profile.type';

@Injectable()
export class GetProfilesUseCase {
  constructor(
    @Inject(PROFILE_QUERY_REPOSITORY)
    private profileQueryRepository: ProfileQueryRepository,
    @Inject(FILE_STORAGE_SERVICE)
    private fileStorageService: IFileStorageService,
  ) {}

  async execute(
    filter: ProfileFilter,
    pagination?: OffsetPagination,
  ): Promise<{ profiles: ProfileView[]; count: number }> {
    pagination = normalizeOffsetPagination(
      pagination ?? { limit: PAGINATION_LIMIT_DEFAULT, offset: 0 },
    );

    const { profiles, count } = await this.profileQueryRepository.findProfiles(
      filter,
      pagination,
    );

    return {
      profiles: await Promise.all(
        profiles.map((profile) => this.toProfileView(profile)),
      ),
      count,
    };
  }

  private async toProfileView(profile: ProfileRecord): Promise<ProfileView> {
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
      about: profile.about,
      age: calculateAge(profile.dateOfBirth),
      avatar,
    };
  }
}
