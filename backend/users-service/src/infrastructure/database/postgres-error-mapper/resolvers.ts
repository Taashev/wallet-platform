import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import {
  AppError,
  NotFoundError,
  UnavailableError,
} from '../../../shared/errors';
import {
  POSTGRES_UNAVAILABLE_ERROR_CODES,
  TYPEORM_UNAVAILABLE_ERROR_NAMES,
} from '../code';

import { PostgresConstraintErrorMap, PostgresDriverError } from './types';
import {
  buildDatabaseDetails,
  getDriverError,
  getErrorCode,
  getQueryFailedErrorConfig,
  resolveMappedConstraintError,
} from './utils';

export function mapAppError(exception: Error): AppError | null {
  if (exception instanceof AppError) {
    return exception;
  }

  return null;
}

export function mapEntityNotFoundError(exception: Error): AppError | null {
  if (!(exception instanceof EntityNotFoundError)) {
    return null;
  }

  return new NotFoundError({
    message: exception.message,
    safeMessage: ERROR_MESSAGES.RESOURCE_NOT_FOUND,
    expose: true,
  });
}

export function mapQueryFailedError(
  exception: Error,
  errorMap?: PostgresConstraintErrorMap,
): AppError | null {
  if (!(exception instanceof QueryFailedError)) {
    return null;
  }

  const driverError = getDriverError(exception);
  const errorCode = driverError?.code;
  const details = buildDatabaseDetails(driverError);

  const mappedError = resolveMappedConstraintError(
    errorMap,
    driverError?.constraint,
  );

  if (mappedError) {
    return mappedError;
  }

  return createMappedQueryFailedError(exception, errorCode, details);
}

export function mapDatabaseUnavailableError(exception: Error): AppError | null {
  if (exception instanceof QueryFailedError) {
    const driverError = getDriverError(exception);
    const errorCode = driverError?.code;

    if (errorCode && POSTGRES_UNAVAILABLE_ERROR_CODES.has(errorCode)) {
      return createDatabaseUnavailableError(exception, driverError);
    }
  }

  if (
    exception instanceof TypeORMError &&
    TYPEORM_UNAVAILABLE_ERROR_NAMES.has(exception.name)
  ) {
    return createDatabaseUnavailableError(exception);
  }

  const errorCode = getErrorCode(exception);

  if (errorCode && POSTGRES_UNAVAILABLE_ERROR_CODES.has(errorCode)) {
    return createDatabaseUnavailableError(exception);
  }

  return null;
}

function createMappedQueryFailedError(
  exception: QueryFailedError<any>,
  errorCode: string | undefined,
  details: ReturnType<typeof buildDatabaseDetails>,
): AppError | null {
  const errorConfig = getQueryFailedErrorConfig(errorCode);

  if (!errorConfig) {
    return null;
  }

  const { ErrorClass, safeMessage } = errorConfig;

  return new ErrorClass({
    message: exception.message,
    safeMessage,
    expose: true,
    details,
  });
}

function createDatabaseUnavailableError(
  exception: Error,
  driverError?: PostgresDriverError,
) {
  return new UnavailableError({
    message: exception.message,
    expose: false,
    details: driverError ? buildDatabaseDetails(driverError) : undefined,
  });
}
