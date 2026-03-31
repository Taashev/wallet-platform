import { Provider } from '@nestjs/common';

import { SessionsTypeOrmRepository } from './database/sessions-typeorm.repository';
import { SESSION_REPOSITORY } from './sessions.keys';

export const sessionsRepositoryProvider: Provider = {
  provide: SESSION_REPOSITORY,
  useClass: SessionsTypeOrmRepository,
};
