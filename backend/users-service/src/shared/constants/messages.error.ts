export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',

  INVALID_REFRESH_TOKEN: 'Невалидный refresh токен',

  INVALID_ACCESS_TOKEN: 'Невалидный токен авторизации',

  INVALID_CREDENTIALS: 'Невалидное имя пользователя или пароль',

  SESSION_NOT_FOUND: 'Сессия не найдена',

  RECORD_NOT_FOUND: 'Запись не найдена',

  DATABASE_UNIQUE_VIOLATION: 'Нарушено ограничение уникальности',

  DATABASE_FOREIGN_KEY_VIOLATION: 'Нарушено ограничение ссылочной целостности',

  DATABASE_NOT_NULL_VIOLATION: 'Обязательное поле не заполнено',

  DATABASE_CHECK_VIOLATION: 'Нарушено ограничение данных',

  DATABASE_EXCLUSION_VIOLATION: 'Конфликт данных по ограничению базы',

  DATABASE_INVALID_TEXT_REPRESENTATION: 'Передан некорректный формат данных',

  DATABASE_QUERY_FAILED: 'Ошибка выполнения запроса к базе данных',

  USERNAME_ALREADY_TAKEN: 'Пользователь с таким username уже существует',

  EMAIL_ALREADY_TAKEN: 'Пользователь с таким email уже существует',

  USER_NOT_FOUND: 'Пользователь не найден',
} as const;
