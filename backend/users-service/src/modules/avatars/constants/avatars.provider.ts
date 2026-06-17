import { Provider } from '@nestjs/common';

import { AvatarsTypeOrmRepository } from '../database/avatars-typeorm.repository';

import { AVATARS_REPOSITORY } from './avatar.keys';

export const AvatarsRepositoryProvider: Provider = {
  provide: AVATARS_REPOSITORY,
  useClass: AvatarsTypeOrmRepository,
};
