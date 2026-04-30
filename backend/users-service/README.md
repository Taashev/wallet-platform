# users-service

`users-service` — отвечает за регистрацию, аутентификацию, сессии и управление профилем пользователя в проекте `Wallet Platform`.

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

## Переменные окружения

Сервис читает конфигурацию из файла `.env` в корне `users-service`.

Минимальный рабочий пример:

```env
NODE_ENV=development
APP_HOST=localhost
APP_PORT=8080

CORS_ORIGINS=*
CORS_ENABLED=true

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

Обязательные переменные:

- `NODE_ENV`
- `CORS_ORIGINS`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_TTL_SECONDS`
- `REFRESH_TOKEN_TTL_SECONDS`
- `SESSION_TTL_SECONDS`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Опциональные переменные и значения по умолчанию:

- `APP_HOST=localhost`
- `APP_PORT=8080`
- `CORS_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS`
- `CORS_ALLOWED_HEADERS=Content-Type,Authorization`
- `CORS_EXPOSED_HEADERS=`
- `CORS_CREDENTIALS=false`
- `CORS_MAX_AGE_SECONDS=3600`
- `CORS_ENABLED=false`
- `PASSWORD_SALT=10`
- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5432`

Назначение переменных:

- `NODE_ENV` — окружение приложения: `development`, `test` или `production`;
- `APP_HOST` / `APP_PORT` — адрес и порт HTTP-сервера;
- `CORS_ORIGINS` — список разрешённых origin через запятую или `*`;
- `CORS_METHODS` — список разрешённых HTTP-методов для CORS;
- `CORS_ALLOWED_HEADERS` — список request headers, разрешённых в CORS-запросах;
- `CORS_EXPOSED_HEADERS` — список response headers, доступных в браузере;
- `CORS_CREDENTIALS` — разрешены ли cookies и auth headers в CORS-запросах;
- `CORS_MAX_AGE_SECONDS` — время кеширования `preflight`-ответа браузером;
- `CORS_ENABLED` — включает или отключает `CORS` при старте;
- `PASSWORD_SALT` — количество salt rounds для `bcrypt`;
- `ACCESS_TOKEN_SECRET` — секрет для access token;
- `REFRESH_TOKEN_SECRET` — секрет для refresh token;
- `ACCESS_TOKEN_TTL_SECONDS` — срок жизни access token в секундах;
- `REFRESH_TOKEN_TTL_SECONDS` — срок жизни refresh token в секундах;
- `SESSION_TTL_SECONDS` — срок жизни записи сессии в БД;
- `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` — параметры подключения к PostgreSQL.

## CORS

Конфигурация `CORS` читается из `.env`, валидируется на старте и приводится к runtime-конфигу до инициализации Nest-приложения.

Поддерживаемое поведение:

- если `CORS_ENABLED=false`, `CORS` не включается вообще;
- `CORS_ORIGINS` может быть `*` или списком origin через запятую;
- строковые значения `true` / `false` для `CORS_ENABLED` и `CORS_CREDENTIALS` явно валидируются;
- если опциональные `CORS_*` переменные не заданы, сервис использует дефолтные значения из конфига.

Пример строгого allowlist для локальной разработки:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
CORS_ENABLED=true
CORS_CREDENTIALS=false
```

Пример для сценария с wildcard:

```env
CORS_ORIGINS=*
CORS_ENABLED=true
```

Для production лучше использовать явный allowlist, а не `*`.

## Быстрый старт

### 1. Установить зависимости

Перейти в корень проекта и установиь зависимости

```bash
npm i
```

### 2. Создать `.env`

Создайте файл `.env` в `backend/users-service` и заполните его значениями из примера выше.

### 3. Поднять PostgreSQL

В каталоге корне проекта есть `docker-compose.yml`, который поднимает необходимые сервисы.

Выполнить команду из корня проекта

```bash
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
