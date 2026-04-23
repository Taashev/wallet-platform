import { HttpClientError } from '@/shared/api/http-client';

export type UsersServiceErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'unavailable'
  | 'unknown';

export type UsersServiceErrorKind = 'backend' | 'network' | 'client';

type UsersServiceErrorArgs = {
  code: UsersServiceErrorCode;
  kind: UsersServiceErrorKind;
  message: string;
  status?: number;
  method?: string;
  url?: string;
  retryable: boolean;
  cause?: unknown;
};

export class UsersServiceError extends Error {
  code: UsersServiceErrorCode;
  kind: UsersServiceErrorKind;
  status?: number;
  method?: string;
  url?: string;
  retryable: boolean;

  constructor({
    code,
    kind,
    message,
    status,
    method,
    url,
    retryable,
    cause,
  }: UsersServiceErrorArgs) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = 'UsersServiceError';
    this.code = code;
    this.kind = kind;
    this.status = status;
    this.method = method;
    this.url = url;
    this.retryable = retryable;
  }
}

function createUsersServiceError(args: UsersServiceErrorArgs) {
  return new UsersServiceError(args);
}

function mapHttpStatusToErrorCode(status?: number): UsersServiceErrorCode {
  switch (status) {
    case 400:
      return 'bad_request';
    case 401:
      return 'unauthorized';
    case 404:
      return 'not_found';
    case 409:
      return 'conflict';
    default:
      return status !== undefined && status >= 500 ? 'unavailable' : 'unknown';
  }
}

function buildHttpStatusMessage(status?: number) {
  switch (status) {
    case 400:
      return 'Request data is invalid or incomplete.';
    case 401:
      return 'Authentication is missing or no longer valid.';
    case 404:
      return 'Requested users-service resource was not found.';
    case 409:
      return 'Request conflicts with existing users-service data.';
    default:
      return status !== undefined && status >= 500
        ? 'Users service is temporarily unavailable.'
        : 'Users service returned an unexpected error response.';
  }
}

export function normalizeUsersServiceError(error: unknown): UsersServiceError {
  if (error instanceof UsersServiceError) {
    return error;
  }

  if (error instanceof HttpClientError) {
    if (error.code === 'network_error') {
      return createUsersServiceError({
        code: 'unavailable',
        kind: 'network',
        message: 'Users service is unavailable or unreachable right now.',
        method: error.method,
        url: error.url,
        retryable: true,
        cause: error,
      });
    }

    if (error.code === 'parse_error') {
      return createUsersServiceError({
        code: 'unknown',
        kind: 'client',
        message: 'Users service returned an unexpected response format.',
        status: error.status,
        method: error.method,
        url: error.url,
        retryable: false,
        cause: error,
      });
    }

    const code = mapHttpStatusToErrorCode(error.status);

    return createUsersServiceError({
      code,
      kind: 'backend',
      message: buildHttpStatusMessage(error.status),
      status: error.status,
      method: error.method,
      url: error.url,
      retryable: code === 'unavailable',
      cause: error,
    });
  }

  if (error instanceof Error) {
    return createUsersServiceError({
      code: 'unknown',
      kind: 'client',
      message: 'Unexpected frontend error happened while talking to users service.',
      retryable: false,
      cause: error,
    });
  }

  return createUsersServiceError({
    code: 'unknown',
    kind: 'client',
    message: 'Unexpected users-service integration error happened.',
    retryable: false,
    cause: error,
  });
}
