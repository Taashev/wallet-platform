import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда запрос корректен, но конфликтует с текущим состоянием системы.
 *
 * Примеры:\
 * 	•	email уже занят\
 * 	•	заказ уже оплачен\
 * 	•	duplicate key\
 * 	•	конфликт версии\
 * 	•	повторное создание того, что уже существует
 *
 * Дефолтный статус: 409
 */
export class ConflictError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'type'>) {
    super({
      type: APP_ERROR_TYPE.conflict,
      message: options.message,
      safeMessage: options.safeMessage,
      expose: options.expose,
      details: options.details,
    });
  }
}
