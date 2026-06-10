import { Provider } from '@nestjs/common';

import { ProfileQueryTypeOrmRepository } from '../database/profile-query-typeorm.repository';

import { PROFILE_QUERY_REPOSITORY } from './profile.keys';

export const ProfileQueryRepositoryProvider: Provider = {
  provide: PROFILE_QUERY_REPOSITORY,
  useClass: ProfileQueryTypeOrmRepository,
};
