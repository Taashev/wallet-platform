import type { UsersServiceError } from '@/shared/api/users-service-error';

export type AuthFormStatus =
  | { kind: 'idle' }
  | { kind: 'submitting'; title: string; description: string }
  | { kind: 'success'; title: string; description: string }
  | { kind: 'error'; title: string; description: string };

export function createIdleAuthFormStatus(): AuthFormStatus {
  return { kind: 'idle' };
}

export function createSubmittingAuthFormStatus(
  title: string,
  description: string,
): AuthFormStatus {
  return {
    kind: 'submitting',
    title,
    description,
  };
}

export function createSuccessAuthFormStatus(
  title: string,
  description: string,
): AuthFormStatus {
  return {
    kind: 'success',
    title,
    description,
  };
}

export function createErrorAuthFormStatus(
  title: string,
  description: string,
): AuthFormStatus {
  return {
    kind: 'error',
    title,
    description,
  };
}

export function createUsersServiceAuthErrorStatus(
  error: UsersServiceError,
): AuthFormStatus {
  return {
    kind: 'error',
    title: 'Auth request failed',
    description: error.message,
  };
}
