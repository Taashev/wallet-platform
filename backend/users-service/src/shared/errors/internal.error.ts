import { ERROR_MESSAGES } from '../constants/messages.error';

import { AppError, AppErrorOptions } from './app.error';
import { APP_ERROR_TYPE } from './type';

/**
 * Когда случилась внутренняя непредвиденная ошибка.
 *
 * Примеры:\
 * 	•	неизвестное исключение\
 * 	•	ошибка кода\
 * 	•	неконсистентное состояние\
 * 	•	то, что не должно было произойти
 *
 * Дефолтный статус: 500
 */
export class InternalError extends AppError {
  constructor(options?: Partial<Omit<AppErrorOptions, 'type'>>) {
    super({
      type: APP_ERROR_TYPE.internal,
      message: options?.message ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      safeMessage: options?.safeMessage ?? ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      expose: options?.expose,
      details: options?.details,
    });
  }
}
