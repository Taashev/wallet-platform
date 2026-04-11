/**
 * Обобщенные ошибки нужны для транспортного слоя, логов, метрик
 */

export const APP_ERROR_TYPE = {
  validation: 'validation',
  not_found: 'not_found',
  conflict: 'conflict',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  unavailable: 'unavailable',
  internal: 'internal',
} as const;

export type AppErrorType = (typeof APP_ERROR_TYPE)[keyof typeof APP_ERROR_TYPE];
