export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен',

  VALIDATION_ERROR: 'Данные запроса заполнены некорректно',

  UNAUTHORIZED: 'Требуется авторизация',
  INVALID_CREDENTIALS: 'Невалидное имя пользователя или пароль',
  INVALID_ACCESS_TOKEN: 'Токен доступа отсутствует или недействителен',
  INVALID_REFRESH_TOKEN: 'Невалидный refresh токен',
  INVALID_SESSION: 'Текущая сессия недействительна',
  INVALID_UPDATE_DATA: 'Неудалось обновить данные',
  SESSION_NOT_FOUND: 'Сессия не найдена',

  RESOURCE_NOT_FOUND: 'Запрошенный ресурс не найден',
  USER_NOT_FOUND: 'Пользователь не найден',

  ALREADY_EXISTS: 'Ресурс уже существует',
  USERNAME_ALREADY_TAKEN: 'Пользователь с таким username уже существует',
  EMAIL_ALREADY_TAKEN: 'Пользователь с таким email уже существует',

  DATABASE_UNIQUE_VIOLATION: 'Нарушено ограничение уникальности',
  DATABASE_FOREIGN_KEY_VIOLATION: 'Нарушено ограничение ссылочной целостности',
  DATABASE_NOT_NULL_VIOLATION: 'Обязательное поле не заполнено',
  DATABASE_CHECK_VIOLATION: 'Нарушено ограничение данных',
  DATABASE_EXCLUSION_VIOLATION: 'Конфликт данных по ограничению базы',
  DATABASE_INVALID_TEXT_REPRESENTATION: 'Передан некорректный формат данных',
  DATABASE_QUERY_FAILED: 'Ошибка выполнения запроса к базе данных',
} as const;
