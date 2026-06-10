import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { DateOfBirth, UserId } from '../../users/types/user.type';
import {
  CurrentProfileRecord,
  ProfileFilter,
  ProfileRecord,
} from '../types/profile.type';

export interface ProfileQueryRepository {
  findActiveProfiles(
    dateOfBirthFrom: DateOfBirth,
    dateOfBirthTo: DateOfBirth,
    pagination: OffsetPagination,
  ): Promise<ProfileRecord[]>;

  getProfileByUserId(userId: UserId): Promise<CurrentProfileRecord | null>;

  findProfiles(
    filter: ProfileFilter,
    pagination: OffsetPagination,
  ): Promise<{ profiles: ProfileRecord[]; count: number }>;
}
