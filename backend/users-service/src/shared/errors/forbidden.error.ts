import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда пользователь аутентифицирован, но не имеет права выполнять действие.
 *
 * Примеры:\
 * 	•	нет роли\
 * 	•	нет доступа к ресурсу\
 * 	•	запрещённая операция
 *
 * Дефолтный статус: 403
 */
export class ForbiddenError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'type'>) {
    super({
      type: APP_ERROR_TYPE.forbidden,
      message: options.message,
      safeMessage: options.safeMessage,
      expose: options.expose,
      details: options.details,
    });
  }
}
