import { EntityNotFoundError, QueryFailedError, TypeORMError } from 'typeorm';

import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import {
  AppError,
  InternalError,
  NotFoundError,
  UnavailableError,
} from '../../shared/errors';

import {
  POSTGRES_UNAVAILABLE_ERROR_CODES,
  QUERY_FAILED_ERROR_MAP,
  TYPEORM_UNAVAILABLE_ERROR_NAMES,
} from './code';

type PostgresDriverError = Error & {
  readonly code?: string;
  readonly detail?: string;
  readonly constraint?: string;
  readonly table?: string;
  readonly column?: string;
  readonly schema?: string;
  readonly routine?: string;
};

export type PostgresConstraintErrorFactory = () => AppError;

export type PostgresConstraintErrorMap = Record<
  string,
  PostgresConstraintErrorFactory
>;

/**
 * Мапит ошибку Postgres или TypeORM в AppError
 * @param exception Исходная ошибка из драйвера, ORM или репозитория
 * @param errorMap Необязательная карта constraint -> AppError или фабрика ошибки
 */
export function mapPostgresErrorToAppError(
  exception: Error,
  errorMap?: PostgresConstraintErrorMap,
): AppError | null {
  return (
    mapAppError(exception) ??
    mapEntityNotFoundError(exception) ??
    mapQueryFailedError(exception, errorMap) ??
    mapTypeOrmUnavailableError(exception) ??
    mapDriverUnavailableError(exception) ??
    null
  );
}

/**
 * Мапит QueryFailedError в AppError по коду Postgres
 * @param exception Ошибка выполнения SQL-запроса
 * @param errorMap Необязательная карта кастомных ошибок по constraint
 */
function mapQueryFailedError(
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

  // Для конкретного constraint передан кастомный маппинг из репозитория
  if (mappedError) {
    return mappedError;
  }

  if (errorCode && POSTGRES_UNAVAILABLE_ERROR_CODES.has(errorCode)) {
    return createDatabaseUnavailableError(exception, driverError);
  }

  return createQueryFailedError(exception, errorCode, details);
}

function mapAppError(exception: Error): AppError | null {
  if (exception instanceof AppError) {
    return exception;
  }

  return null;
}

function mapEntityNotFoundError(exception: Error): AppError | null {
  if (!(exception instanceof EntityNotFoundError)) {
    return null;
  }

  return new NotFoundError({
    message: exception.message,
    safeMessage: ERROR_MESSAGES.RECORD_NOT_FOUND,
    expose: true,
  });
}

function mapTypeOrmUnavailableError(exception: Error): AppError | null {
  if (
    exception instanceof TypeORMError &&
    TYPEORM_UNAVAILABLE_ERROR_NAMES.has(exception.name)
  ) {
    return createDatabaseUnavailableError(exception);
  }

  return null;
}

function mapDriverUnavailableError(exception: Error): AppError | null {
  const errorCode = getErrorCode(exception);

  if (errorCode && POSTGRES_UNAVAILABLE_ERROR_CODES.has(errorCode)) {
    return createDatabaseUnavailableError(exception);
  }

  return null;
}

function getQueryFailedErrorConfig(errorCode: string | undefined) {
  if (!errorCode || !(errorCode in QUERY_FAILED_ERROR_MAP)) {
    return null;
  }

  return QUERY_FAILED_ERROR_MAP[
    errorCode as keyof typeof QUERY_FAILED_ERROR_MAP
  ];
}

/**
 * Достает driverError из QueryFailedError
 * @param exception Ошибка выполнения SQL-запроса
 */
function getDriverError(
  exception: QueryFailedError<any>,
): PostgresDriverError | null {
  const candidate: unknown = exception.driverError;

  if (candidate && typeof candidate === 'object') {
    return candidate as PostgresDriverError;
  }

  return null;
}

/**
 * Достает строковый код ошибки из объекта Error
 * @param exception Исходная ошибка
 */
function getErrorCode(exception: Error): string | undefined {
  const errorWithCode = exception as Error & { readonly code?: string };

  return errorWithCode.code;
}

/**
 * Ищет кастомную ошибку по имени constraint
 * @param errorMap Карта кастомных ошибок по constraint
 * @param constraint Имя ограничения из Postgres
 */
function resolveMappedConstraintError(
  errorMap: PostgresConstraintErrorMap | undefined,
  constraint: string | undefined,
) {
  // Карта не передана или у ошибки нет имени constraint
  if (!errorMap || !constraint) {
    return null;
  }

  const mappedError = errorMap[constraint];

  // Для этого constraint нет пользовательского обработчика
  if (!mappedError) {
    return null;
  }

  return mappedError();
}

/**
 * Собирает безопасные детали ошибки базы данных
 * @param driverError Ошибка драйвера Postgres
 */
function buildDatabaseDetails(driverError?: PostgresDriverError | null) {
  if (!driverError) {
    return undefined;
  }

  const field =
    driverError.column ?? extractFieldFromDetail(driverError.detail);

  return {
    // driverCode: driverError.code,
    // constraint: driverError.constraint,
    // table: driverError.table,
    column: driverError.column,
    field,
    // schema: driverError.schema,
    detail: driverError.detail,
  };
}

/**
 * Извлекает имя поля из detail строки Postgres
 * @param detail Текст детали ошибки от драйвера
 */
function extractFieldFromDetail(detail?: string) {
  if (!detail) {
    return undefined;
  }

  const match = detail.match(/Key \((.+?)\)=/);

  return match?.[1];
}

function createQueryFailedError(
  exception: QueryFailedError<any>,
  errorCode: string | undefined,
  details: ReturnType<typeof buildDatabaseDetails>,
): AppError {
  const errorConfig = getQueryFailedErrorConfig(errorCode);

  if (!errorConfig) {
    return new InternalError({
      message: exception.message,
      safeMessage: ERROR_MESSAGES.DATABASE_QUERY_FAILED,
      expose: false,
      details,
    });
  }

  const { ErrorClass, safeMessage } = errorConfig;

  return new ErrorClass({
    message: exception.message,
    safeMessage,
    expose: true,
    details,
  });
}

/**
 * Создает ошибку недоступности базы данных
 * @param exception Исходная инфраструктурная ошибка
 * @param driverError Необязательные детали ошибки драйвера Postgres
 */
function createDatabaseUnavailableError(
  exception: Error,
  driverError?: PostgresDriverError,
) {
  return new UnavailableError({
    message: exception.message,
    safeMessage: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    expose: false,
    details: driverError ? buildDatabaseDetails(driverError) : undefined,
  });
}
