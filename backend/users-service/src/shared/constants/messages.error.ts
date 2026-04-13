export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен',
  REQUEST_TIMEOUT: 'Время ожидания запроса истекло',
  TOO_MANY_REQUESTS: 'Слишком много запросов, попробуйте позже',

  VALIDATION_ERROR: 'Данные запроса заполнены некорректно',
  INVALID_INPUT: 'Переданы некорректные данные',
  INVALID_QUERY_PARAMS: 'Параметры запроса заполнены некорректно',
  INVALID_REQUEST_BODY: 'Тело запроса заполнено некорректно',
  INVALID_UUID: 'Передан некорректный идентификатор',
  INVALID_PAGINATION: 'Параметры пагинации заполнены некорректно',
  REQUIRED_FIELD_MISSING: 'Не заполнены обязательные поля',

  UNAUTHORIZED: 'Требуется авторизация',
  INVALID_CREDENTIALS: 'Невалидное имя пользователя или пароль',
  ACCESS_DENIED: 'Недостаточно прав для выполнения операции',
  INVALID_ACCESS_TOKEN: 'Невалидный токен авторизации',
  INVALID_REFRESH_TOKEN: 'Невалидный refresh токен',
  SESSION_EXPIRED: 'Сессия истекла',
  SESSION_NOT_FOUND: 'Сессия не найдена',
  FORBIDDEN: 'Доступ запрещен',

  RESOURCE_NOT_FOUND: 'Запрошенный ресурс не найден',
  USER_NOT_FOUND: 'Пользователь не найден',

  ALREADY_EXISTS: 'Ресурс уже существует',
  USERNAME_ALREADY_TAKEN: 'Пользователь с таким username уже существует',
  EMAIL_ALREADY_TAKEN: 'Пользователь с таким email уже существует',

  LIMIT_EXCEEDED: 'Превышено допустимое ограничение',

  CONFLICT: 'Конфликт данных',
  DATABASE_ERROR: 'Ошибка при работе с данными',
  DATABASE_UNIQUE_VIOLATION: 'Нарушено ограничение уникальности',
  DATABASE_FOREIGN_KEY_VIOLATION: 'Нарушено ограничение ссылочной целостности',
  DATABASE_NOT_NULL_VIOLATION: 'Обязательное поле не заполнено',
  DATABASE_CHECK_VIOLATION: 'Нарушено ограничение данных',
  DATABASE_EXCLUSION_VIOLATION: 'Конфликт данных по ограничению базы',
  DATABASE_INVALID_TEXT_REPRESENTATION: 'Передан некорректный формат данных',
  DATABASE_QUERY_FAILED: 'Ошибка выполнения запроса к базе данных',
} as const;
