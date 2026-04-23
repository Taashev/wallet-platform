import { AppError } from '../../../shared/errors';

import {
  mapAppError,
  mapDatabaseUnavailableError,
  mapEntityNotFoundError,
  mapQueryFailedError,
} from './resolvers';
import { PostgresConstraintErrorMap } from './types';

export type {
  PostgresConstraintErrorFactory,
  PostgresConstraintErrorMap,
  PostgresDriverError,
} from './types';

export function mapPostgresErrorToAppError(
  exception: Error,
  errorMap?: PostgresConstraintErrorMap,
): AppError | null {
  return (
    mapAppError(exception) ??
    mapEntityNotFoundError(exception) ??
    mapQueryFailedError(exception, errorMap) ??
    mapDatabaseUnavailableError(exception) ??
    null
  );
}
