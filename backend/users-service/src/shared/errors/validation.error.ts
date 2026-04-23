import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда входные данные некорректны по смыслу запроса или команды.
 *
 * Примеры:\
 * 	• неправильный формат\
 * 	• обязательное поле отсутствует\
 * 	• значение вне диапазона\
 * 	• тело запроса не прошло прикладную проверку
 *
 * Дефолтный статус: 400\
 * Так же может быть: 422
 */
export class ValidationError extends AppError {
  constructor(options: Omit<AppErrorOptions, 'type'>) {
    super({
      type: APP_ERROR_TYPE.validation,
      message: options.message,
      safeMessage: options.safeMessage,
      expose: options.expose,
      details: options.details,
    });
  }
}
