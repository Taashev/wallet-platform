import { QueryFailedError } from 'typeorm';

import { QUERY_FAILED_ERROR_MAP } from '../code';

import { PostgresConstraintErrorMap, PostgresDriverError } from './types';

export function getQueryFailedErrorConfig(errorCode: string | undefined) {
  if (!errorCode || !(errorCode in QUERY_FAILED_ERROR_MAP)) {
    return null;
  }

  return QUERY_FAILED_ERROR_MAP[
    errorCode as keyof typeof QUERY_FAILED_ERROR_MAP
  ];
}

export function getDriverError(
  exception: QueryFailedError<any>,
): PostgresDriverError | null {
  const candidate: unknown = exception.driverError;

  if (candidate && typeof candidate === 'object') {
    return candidate as PostgresDriverError;
  }

  return null;
}

export function getErrorCode(exception: Error): string | undefined {
  const errorWithCode = exception as Error & { readonly code?: string };

  return errorWithCode.code;
}

export function resolveMappedConstraintError(
  errorMap: PostgresConstraintErrorMap | undefined,
  constraint: string | undefined,
) {
  if (!errorMap || !constraint) {
    return null;
  }

  const mappedError = errorMap[constraint];

  if (!mappedError) {
    return null;
  }

  return mappedError();
}

export function buildDatabaseDetails(driverError?: PostgresDriverError | null) {
  if (!driverError) {
    return undefined;
  }

  const field =
    driverError.column ?? extractFieldFromDetail(driverError.detail);

  return {
    column: driverError.column,
    field,
  };
}

function extractFieldFromDetail(detail?: string) {
  if (!detail) {
    return undefined;
  }

  const match = detail.match(/Key \((.+?)\)=/);

  return match?.[1];
}
