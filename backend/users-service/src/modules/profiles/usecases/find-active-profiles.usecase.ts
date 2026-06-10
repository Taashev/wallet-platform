import { Inject, Injectable } from '@nestjs/common';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';
import { ValidationError } from '../../../shared/errors';
import { normalizeOffsetPagination } from '../../../shared/pagination/notmalize-offset-pagination';
import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { calculateAge } from '../../users/domain/calculate-age';
import { getDateOfBirthRangeForAge } from '../../users/domain/get-date-of-birth-range-for-age';
import { PROFILE_QUERY_REPOSITORY } from '../constants/profile.keys';
import type { ProfileQueryRepository } from '../interfaces/profile-query-repository.interface';
import type {
  ActiveProfileRecord,
  ProfileView,
  ProfileViewAvatar,
} from '../types/profile.type';

const AVATAR_URL_EXPIRES_IN_SECONDS = 900;

@Injectable()
export class FindActiveProfilesUseCase {
  constructor(
    @Inject(PROFILE_QUERY_REPOSITORY)
    private profileQueryRepository: ProfileQueryRepository,
    @Inject(FILE_STORAGE_SERVICE)
    private fileStorageService: IFileStorageService,
  ) {}

  async execute(
    minAge: number,
    maxAge: number,
    pagination: OffsetPagination,
  ): Promise<ProfileView[]> {
    if (minAge > maxAge) {
      throw new ValidationError({
        message: 'Минимальный возраст не может быть больше максимального',
        expose: true,
        details: { field: 'minAge' },
      });
    }

    const today = new Date();

    const dateOfBirthRange = getDateOfBirthRangeForAge({
      minAge,
      maxAge,
      referenceDate: today,
    });

    const profiles = await this.profileQueryRepository.findActiveProfiles(
      dateOfBirthRange.from,
      dateOfBirthRange.to,
      normalizeOffsetPagination(pagination),
    );

    return await Promise.all(
      profiles.map((profile) => this.toProfileView(profile, today)),
    );
  }

  private async toProfileView(
    profile: ActiveProfileRecord,
    today: Date,
  ): Promise<ProfileView> {
    let avatar: ProfileViewAvatar = null;

    if (profile.avatar !== null) {
      const url = await this.fileStorageService.getPresignedDownloadUrl(
        profile.avatar.storageKey,
        {
          expiresInSeconds: AVATAR_URL_EXPIRES_IN_SECONDS,
        },
      );

      avatar = { avatarId: profile.avatar.avatarId, url };
    }

    return {
      userId: profile.userId,
      username: profile.username,
      about: profile.about,
      age: calculateAge(profile.dateOfBirth, today),
      avatar,
    };
  }
}
