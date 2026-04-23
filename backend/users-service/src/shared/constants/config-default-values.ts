export const DEFAULT_APP_HOST = 'localhost';
export const DEFAULT_APP_PORT = 8080;

// Методы, разрешённые для CORS-запросов.
export const DEFAULT_CORS_METHODS = 'GET,POST,PUT,PATCH,DELETE,OPTIONS';
// Заголовки, которые браузер может отправлять в CORS-запросах.
export const DEFAULT_CORS_ALLOWED_HEADERS = 'Content-Type,Authorization';
// Заголовки ответа, доступные в браузере.
export const DEFAULT_CORS_EXPOSED_HEADERS = '';
// Разрешены ли cookies и auth-заголовки в CORS-запросах.
export const DEFAULT_CORS_CREDENTIALS = 'false';
// Время кеширования preflight-ответа браузером.
export const DEFAULT_CORS_MAX_AGE_SECONDS = '3600';
// Включён ли CORS при старте приложения.
export const DEFAULT_CORS_ENABLED = 'false';

export const DEFAULT_PASSWORD_SALT = 10;

export const DEFAULT_POSTGRES_HOST = 'localhost';
export const DEFAULT_POSTGRES_PORT = 5432;
