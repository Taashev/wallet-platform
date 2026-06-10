import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { DateOfBirth } from '../../users/types/user.type';
import { ActiveProfileRecord } from '../types/profile.type';

export interface ProfileQueryRepository {
  findActiveProfiles(
    dateOfBirthFrom: DateOfBirth,
    dateOfBirthTo: DateOfBirth,
    pagination: OffsetPagination,
  ): Promise<ActiveProfileRecord[]>;
}
