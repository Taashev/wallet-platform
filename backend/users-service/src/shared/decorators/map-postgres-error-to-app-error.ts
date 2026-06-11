import {
  mapPostgresErrorToAppError,
  PostgresConstraintErrorMap,
} from '../../infrastructure/database/postgres-error-mapper';
import { InternalError } from '../errors';

type AsyncMethod = (...args: unknown[]) => unknown;
const ASYNC_FUNCTION_TAG = '[object AsyncFunction]';

type TypedPropertyDescriptor<T> = {
  value?: T;
  configurable?: boolean;
  enumerable?: boolean;
  writable?: boolean;
  get?: () => T;
  set?: (value: T) => void;
};

/**
 * Оборачивает метод в общий try/catch и нормализует ошибки базы
 */
function wrapMethod(
  originalMethod: AsyncMethod,
  errorMap?: PostgresConstraintErrorMap,
) {
  return async function wrappedMethod(this: unknown, ...args: unknown[]) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await originalMethod.apply(this, args);
    } catch (error) {
      const appError = mapPostgresErrorToAppError(error as Error, errorMap);

      if (!appError) {
        throw new InternalError();
      }

      throw appError;
    }
  };
}

/**
 * Подменяет один метод оберткой с маппингом ошибок
 */
function applyMethodDecorator(
  descriptor: TypedPropertyDescriptor<AsyncMethod>,
  errorMap?: PostgresConstraintErrorMap,
) {
  const originalMethod = descriptor.value;

  if (!originalMethod) {
    return descriptor;
  }

  descriptor.value = wrapMethod(originalMethod, errorMap);

  return descriptor;
}

/**
 * Вешает обертку на все методы класса кроме constructor
 */
function applyClassDecorator<T extends { prototype: Record<string, unknown> }>(
  target: T,
  errorMap?: PostgresConstraintErrorMap,
) {
  const propertyNames = Object.getOwnPropertyNames(target.prototype);

  for (const propertyName of propertyNames) {
    if (propertyName === 'constructor') {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      target.prototype,
      propertyName,
    );

    if (!descriptor || typeof descriptor.value !== 'function') {
      continue;
    }

    if (
      Object.prototype.toString.call(descriptor.value) !== ASYNC_FUNCTION_TAG
    ) {
      continue;
    }

    const updatedDescriptor = applyMethodDecorator(descriptor, errorMap);

    Object.defineProperty(target.prototype, propertyName, updatedDescriptor);
  }
}

/**
 * Декоратор для метода или класса с общим маппингом ошибок Postgres
 */
export function MapPostgresErrorToAppError(
  errorMap?: PostgresConstraintErrorMap,
): ClassDecorator & MethodDecorator {
  return ((
    target: object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<AsyncMethod>,
  ) => {
    if (descriptor) {
      return applyMethodDecorator(descriptor, errorMap);
    }

    applyClassDecorator(
      target as { prototype: Record<string, unknown> },
      errorMap,
    );
  }) as ClassDecorator & MethodDecorator;
}
