# users-service

`users-service` — backend-сервис на `NestJS`, который отвечает за регистрацию, аутентификацию, сессии и управление профилем пользователя в проекте `Wallet Platform`.

Сервис использует:

- `NestJS 11`
- `TypeORM`
- `PostgreSQL`
- `Swagger`
- `JWT access/refresh tokens`

## Что умеет сервис

- регистрация пользователя;
- вход по `username` и `password`;
- обновление пары `accessToken` / `refreshToken`;
- выход из текущей сессии;
- получение текущего профиля;
- обновление профиля;
- смена пароля;
- мягкое удаление текущего пользователя;
- получение списка пользователей с пагинацией и фильтром по `username`.

## Требования

- `Node.js` 24.13.1;
- `npm` 11.8.0;
- `Docker` и `Docker Compose` для локального запуска PostgreSQL.

## Переменные окружения

Сервис читает конфигурацию из файла `.env` в корне `users-service`.

Обязательные переменные:

```env
NODE_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8080

PASSWORD_SALT=10

ACCESS_TOKEN_SECRET=change-me-access-secret
REFRESH_TOKEN_SECRET=change-me-refresh-secret
ACCESS_TOKEN_TTL_SECONDS=900
REFRESH_TOKEN_TTL_SECONDS=604800
SESSION_TTL_SECONDS=2592000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=users_service
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

Назначение переменных:

- `NODE_ENV` — окружение приложения: `development`, `test` или `production`;
- `APP_HOST` / `APP_PORT` — адрес и порт HTTP-сервера;
- `PASSWORD_SALT` — количество salt rounds для `bcrypt`;
- `ACCESS_TOKEN_SECRET` — секрет для access token;
- `REFRESH_TOKEN_SECRET` — секрет для refresh token;
- `ACCESS_TOKEN_TTL_SECONDS` — срок жизни access token в секундах;
- `REFRESH_TOKEN_TTL_SECONDS` — срок жизни refresh token в секундах;
- `SESSION_TTL_SECONDS` — срок жизни записи сессии в БД;
- `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` — параметры подключения к PostgreSQL.

## Быстрый старт

### 1. Установить зависимости

```bash
cd backend/users-service
npm install
```

### 2. Создать `.env`

Создайте файл `.env` в `backend/users-service` и заполните его значениями из примера выше.

### 3. Поднять PostgreSQL

В каталоге `backend/users-service` есть `docker-compose.yml`, который поднимает только базу данных.

```bash
cd backend/users-service
docker compose up -d
```

Проверить контейнер можно так:

```bash
docker compose ps
```

### 4. Применить миграции

```bash
cd backend/users-service
npm run migrate:up
```

### 5. Запустить сервис

Для разработки:

```bash
cd backend/users-service
npm run start:dev
```

Для production-сценария:

```bash
cd backend/users-service
npm run build
npm run start:prod
```

## Команды

```bash
npm run start         # обычный запуск
npm run start:dev     # запуск в watch-режиме
npm run start:debug   # запуск с debug и watch
npm run build         # сборка проекта
npm run start:prod    # запуск собранного приложения

npm run lint          # eslint --fix
npm run test          # unit tests

npm run migrate:up    # применить миграции
npm run migrate:down  # откатить последнюю миграцию
```

## HTTP API

Все маршруты версионируются через URI и доступны под префиксом `/v1`.

Большинство пользовательских ручек требуют `Bearer` access token.

## Работа с базой данных

Сервис использует `TypeORM` с отключённым `synchronize`, поэтому изменения схемы нужно вносить только через миграции.

Текущие миграции лежат в:

- `src/infrastructure/database/migrations`

CLI подключается к БД через `.env`, используя data source

## Проверка после запуска

Базовый сценарий проверки:

1. Открыть Swagger: `http://127.0.0.1:8080/docs/v1`
2. Выполнить `POST /v1/auth/signup`
3. Скопировать `accessToken`
4. Авторизоваться через кнопку `Authorize` в Swagger
5. Проверить `GET /v1/users/me`
