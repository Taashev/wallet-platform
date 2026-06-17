import { Provider } from '@nestjs/common';

import { UsersTypeOrmRepository } from '../database/users-typeorm.repository';

import { USERS_REPOSITORY } from './users.keys';

export const UsersReposirotyProvider: Provider = {
  provide: USERS_REPOSITORY,
  useClass: UsersTypeOrmRepository,
};
