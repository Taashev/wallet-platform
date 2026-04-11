import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { ConflictError, ValidationError } from '../../../shared/errors';

// Коды ошибки SQL запроса
export const QUERY_FAILED_ERROR_MAP = {
  // Нарушено ограничение уникальности
  '23505': {
    ErrorClass: ConflictError,
    safeMessage: ERROR_MESSAGES.DATABASE_UNIQUE_VIOLATION,
  },
  // Нарушена ссылочная целостность
  '23503': {
    ErrorClass: ConflictError,
    safeMessage: ERROR_MESSAGES.DATABASE_FOREIGN_KEY_VIOLATION,
  },
  // Обязательное поле получило null
  '23502': {
    ErrorClass: ValidationError,
    safeMessage: ERROR_MESSAGES.DATABASE_NOT_NULL_VIOLATION,
  },
  // Нарушено check-ограничение
  '23514': {
    ErrorClass: ValidationError,
    safeMessage: ERROR_MESSAGES.DATABASE_CHECK_VIOLATION,
  },
  // Нарушено exclusion-ограничение
  '23P01': {
    ErrorClass: ConflictError,
    safeMessage: ERROR_MESSAGES.DATABASE_EXCLUSION_VIOLATION,
  },
  // Передано значение в неверном формате
  '22P02': {
    ErrorClass: ValidationError,
    safeMessage: ERROR_MESSAGES.DATABASE_INVALID_TEXT_REPRESENTATION,
  },
} as const;

// Коды Postgres для недоступности базы данных
export const POSTGRES_UNAVAILABLE_ERROR_CODES = new Set([
  // Общая ошибка соединения с БД
  '08000',
  // Не удалось установить соединение с БД
  '08001',
  // Соединение с БД не существует
  '08003',
  // Сервер БД отклонил соединение
  '08004',
  // Соединение с БД оборвалось
  '08006',
  // Не удалось завершить транзакцию из-за сбоя соединения
  '08007',
  // Ошибка протокола обмена с БД
  '08P01',
  // БД исчерпала лимит подключений
  '53300',
  // Администратор остановил сервер БД
  '57P01',
  // Сервер БД завершает работу из-за сбоя
  '57P02',
  // БД временно не принимает подключения
  '57P03',
  // Клиент не смог подключиться к серверу БД
  '58030',
  // Соединение было отклонено
  'ECONNREFUSED',
  // Соединение было принудительно разорвано
  'ECONNRESET',
  // Узел с БД недоступен
  'EHOSTUNREACH',
  // Сеть до БД недоступна
  'ENETUNREACH',
  // Не удалось разрешить адрес хоста БД
  'ENOTFOUND',
  // Истекло время ожидания соединения
  'ETIMEDOUT',
]);

// Названия ошибок TypeORM при проблемах с подключением к базе
export const TYPEORM_UNAVAILABLE_ERROR_NAMES = new Set([
  // Попытка выполнить запрос без активного подключения
  'CannotExecuteNotConnectedError',
  // Подключение к БД еще не было установлено
  'ConnectionIsNotSetError',
  // TypeORM не нашел зарегистрированное подключение
  'ConnectionNotFoundError',
  // TypeORM не смог определить сущность для операции
  'CannotDetermineEntityError',
]);
