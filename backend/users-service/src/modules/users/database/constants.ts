import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { ConflictError } from '../../../shared/errors';

export const USERS_CONSTRAINT_USER_ID_PK = 'USERS_CONSTRAINT_USER_ID_PK';

export const USERS_CONSTRAINT_USERNAME_UQ = 'USERS_CONSTRAINT_USERNAME_UQ';

export const USERS_CONSTRAINT_EMAIL_UQ = 'USERS_CONSTRAINT_EMAIL_UQ';

export const userPostgresErrorMap = {
  [USERS_CONSTRAINT_USERNAME_UQ]: () =>
    new ConflictError({
      message: ERROR_MESSAGES.USERNAME_ALREADY_TAKEN,
      expose: true,
    }),
  [USERS_CONSTRAINT_EMAIL_UQ]: () =>
    new ConflictError({
      message: ERROR_MESSAGES.EMAIL_ALREADY_TAKEN,
      expose: true,
    }),
};
