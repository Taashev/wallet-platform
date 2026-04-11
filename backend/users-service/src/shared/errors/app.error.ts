import { AppErrorType } from './type';

export type AppErrorDetails = Record<string, unknown>;

export type AppErrorOptions = {
  /**
   * Тип ошибки
   * Категория, по которой определяется общее поведение ошибки
   */
  readonly type: AppErrorType;
  /**
   * Техническое сообщение ошибки
   * Внутреннее описание ошибки
   * Может содержать детали, которые не стоит показывать клиенту
   */
  readonly message: string;
  /**
   * Безопасное сообщение для клиента
   * Будет использовано во внешнем ответе, если `expose` установлен в `true`
   * Если не указано, по умолчанию используется `message`
   */
  readonly safeMessage?: string;
  /**
   * Можно ли раскрывать ошибку наружу
   * Если `true`, может вернуть `safeMessage` и `details` клиенту
   * Если `false`, наружу должен уходить общий текст без внутренних деталей
   */
  readonly expose?: boolean;
  /**
   * Дополнительные данные по ситуации
   * Обычно это безопасные структурированные поля, полезные вызывающему коду
   * или клиенту: `field`, `entity`, `reason` и т.п.
   */
  readonly details?: AppErrorDetails;
};

export class AppError extends Error {
  /**
   * Базовая ошибка приложения
   *
   * Используется как единый контракт между слоями системы:
   * repository/service/use case выбрасывает `AppError`,
   * а транспорт решает, как превратить его в HTTP response, log
   * или другой внешний формат
   *
   * Рекомендуемый способ создания ошибок:
   *
   * ```ts
   * throw new AppError({
   *   type: APP_ERROR_TYPE.conflict,
   *   message: 'Нарушено ограничение уникальности email пользователя',
   *   safeMessage: 'Пользователь с таким email уже существует',
   *   expose: true,
   *   details: {
   *     entity: 'user',
   *     field: 'email',
   *   },
   * });
   * ```
   *
   * @param {AppErrorOptions} options Параметры ошибки
   * `type` — категория ошибки
   * `message` — внутреннее техническое сообщение
   * `safeMessage` — сообщение для клиента
   * `expose` — можно ли раскрывать ошибку наружу
   * `details` — дополнительные структурированные данные
   */
  readonly type: AppErrorType;
  readonly message: string;
  readonly safeMessage: string;
  readonly expose: boolean;
  readonly details?: AppErrorDetails;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = AppError.name;
    Object.setPrototypeOf(this, AppError.prototype);
    this.type = options.type;
    this.message = options.message;
    this.safeMessage = options.safeMessage ?? options.message;
    this.expose = options.expose ?? false;
    this.details = options.details;
  }
}
