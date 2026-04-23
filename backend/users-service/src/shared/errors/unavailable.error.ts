import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда зависимость или система временно недоступна.
 *
 * Примеры:\
 * 	•	база недоступна\
 * 	•	внешний сервис не отвечает\
 * 	•	Redis недоступен\
 * 	•	timeout зависимости
 *
 * Дефолтный статус: 503
 */
export class UnavailableError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'type'>) {
    super({
      type: APP_ERROR_TYPE.unavailable,
      message: options.message,
      safeMessage: options.safeMessage,
      expose: options.expose,
      details: options.details,
    });
  }
}
