import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда сущность или ресурс не найден.
 *
 * Примеры:\
 * 	•	пользователь не найден\
 * 	•	заказ не найден\
 * 	•	файл не найден
 *
 * Дефолтный статус: 404
 */
export class NotFoundError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'type'>) {
    super({
      type: APP_ERROR_TYPE.not_found,
      message: options.message,
      safeMessage: options.safeMessage,
      expose: options.expose,
      details: options.details,
    });
  }
}
