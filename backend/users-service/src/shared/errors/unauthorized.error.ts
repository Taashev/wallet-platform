import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда пользователь не аутентифицирован.
 *
 * Примеры:\
 * 	•	нет токена\
 * 	•	токен невалидный\
 * 	•	токен просрочен
 *
 * Дефолтный статус: 401
 */
export class UnauthorizedError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'type'>) {
    super({
      type: APP_ERROR_TYPE.unauthorized,
      message: options.message,
      safeMessage: options.safeMessage,
      expose: options.expose,
      details: options.details,
    });
  }
}
