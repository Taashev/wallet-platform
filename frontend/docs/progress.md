# Progress Log — Users Service Web MVP

## Формат записей

Каждая итерация добавляет запись в формате:

## Итерация N — [Дата]
**Фича:** [Название]
**Статус:** [Завершено / В процессе / Заблокировано]
**Что сделано:**
- ...
**Следующие шаги:**
- ...
**Заметки для следующей итерации:**
- ...

---

## Итерация 1 — 2026-04-19
**Фича:** TASK-001 — foundation frontend-приложения
**Статус:** Завершено
**Что сделано:**
- Поднят baseline-проект на `React + TypeScript + Vite` внутри `frontend`
- Собрана базовая структура `app / pages / features / shared` и добавлен резерв под `entities`
- Настроены команды `npm run dev`, `npm run lint`, `npm run build` и `npm run check`
- Добавлен стартовый экран без роутера и бизнес-логики следующих задач
**Следующие шаги:**
- Перейти к `TASK-002` и собрать app shell с router, providers и layout-слоями
**Заметки для следующей итерации:**
- Базовый alias `@/*` уже настроен, можно сразу раскладывать app shell по модульной структуре
- Dev server успешно стартует локально, build и lint проходят без ошибок

## Итерация 2 — 2026-04-20
**Фича:** TASK-002 — app shell с router и layout-слоями
**Статус:** Завершено
**Что сделано:**
- Подключён `react-router-dom` и собран route tree для публичных и защищённых маршрутов MVP
- Вынесены отдельные `PublicLayout` и `ProtectedLayout` с разными shell-обвязками и навигацией
- Добавлены placeholder-страницы для `sign-in`, `sign-up`, `profile`, `profile/edit`, `profile/password`, `users`, `profile/delete`
- Router встроен через `AppProviders`, а переходы внутри приложения переведены на `Link` и `NavLink`
**Следующие шаги:**
- Перейти к `TASK-003` и добавить env-конфигурацию frontend для `users-service`
**Заметки для следующей итерации:**
- Guard-логика авторизации сознательно не добавлялась: она выделена в `TASK-010`
- `npm run check` проходит, dev server поднимался, `/sign-in` и `/profile` успешно отвечали через router shell

## Итерация 3 — 2026-04-20
**Фича:** TASK-003 — env-конфигурация и API base URL для users-service
**Статус:** Завершено
**Что сделано:**
- Добавлен централизованный модуль env-конфигурации для `users-service` с поддержкой `VITE_USERS_SERVICE_API_BASE_URL` и legacy fallback `VITE_USERS_SERVICE_API_URL`
- Приложение теперь делает раннюю проверку конфигурации и показывает отдельный configuration error screen при отсутствии или невалидности base URL
- На `sign-in` добавлена connection card, которая использует base URL из env и делает probe-запрос к `users-service`, не хардкодя адрес в страницах
- Добавлены `frontend/.env.example`, типизация `import.meta.env` и документация по env-настройке в `README.md`
**Следующие шаги:**
- Перейти к `TASK-004` и вынести сетевой доступ в единый HTTP-клиент поверх уже настроенного base URL
**Заметки для следующей итерации:**
- Probe использует публичный путь `docs/v1` и `no-cors` fetch только как reachability-check до появления полноценного API-клиента
- Валидный URL нормализуется централизованно, а невалидный превращается в явную config-ошибку до загрузки маршрутов

## Итерация 4 — 2026-04-20
**Фича:** TASK-004 — единый HTTP-клиент для users-service
**Статус:** Завершено
**Что сделано:**
- Добавлен общий HTTP-клиент в `shared/api` с поддержкой base URL, query params, общих заголовков и JSON body
- Вынесен отдельный `users-service` client wrapper с extension points под auth headers, retry и `401`-обработку
- HTTP-клиент поднят в `app/providers` через context/provider, чтобы страницы не создавали сетевой слой локально
- `UsersServiceConnectionCard` переведена с прямого `fetch` на единый HTTP-клиент как первый consumer
**Следующие шаги:**
- Перейти к `TASK-005` и выделить contract layer для auth, profile и users list поверх нового клиента
**Заметки для следующей итерации:**
- Прямых `fetch` в страницах и фичах больше нет; сетевой доступ централизован в `shared/api/http-client.ts`
- Реальный backend на `127.0.0.1:8080` в этой сессии не был поднят, поэтому live users-service запрос проверить не удалось; сам клиент отдельно проверен через mocked `fetch` на base URL, headers и retry

## Итерация 5 — 2026-04-20
**Фича:** TASK-005 — contract layer и tolerant normalization
**Статус:** Завершено
**Что сделано:**
- Добавлены DTO-типы для auth, profile и users list на основе `swagger-users-service.json`
- Собраны нормализованные модели `AuthSession`, `UserProfile`, `UsersList` и tolerant normalizers для спорных полей `about`, `dateOfBirth`, `age`
- Экранные модули `sign-in`, `profile` и `users` теперь используют preview через нормализованные модели, а не рендерят raw DTO напрямую
- Добавлена наглядная contract preview карточка, чтобы видеть разницу между сырым payload и нормализованной моделью
**Следующие шаги:**
- Перейти к `TASK-006` и централизовать нормализацию backend/network ошибок поверх текущего contract layer
**Заметки для следующей итерации:**
- Swagger помечает `about`, `dateOfBirth` и `age` как required, но frontend уже нормализует их defensively в `null`, если backend вернёт пустые или спорные значения
- Contract layer отдельно проверен через изолированный прогон нормализаторов после сборки TypeScript

## Итерация 6 — 2026-04-20
**Фича:** TASK-006 — централизованная нормализация backend и network ошибок
**Статус:** Завершено
**Что сделано:**
- Добавлена единая модель `UsersServiceError` с нормализованными кодами `bad_request`, `unauthorized`, `not_found`, `conflict`, `unavailable`, `unknown`
- `users-service` HTTP wrapper теперь перекидывает low-level ошибки клиента в единый error format вместо прямой утечки `HttpClientError` в UI
- `UsersServiceConnectionCard` переведена на нормализованную ошибку и больше не собирает fallback-сообщения вручную из transport-слоя
- Экспортированы типы request options HTTP-клиента, чтобы сохранить строгие generic-сигнатуры после обёртки users-service client
**Следующие шаги:**
- Перейти к `TASK-007` и зафиксировать стратегию хранения токенов и session-модуль
**Заметки для следующей итерации:**
- Изолированный прогон через mocked `fetch` подтвердил единый формат для `400`, `401`, `404`, `409`, `503` и сетевого сбоя
- Для MVP пользовательские сообщения намеренно не завязаны на нестабильный текст backend-ответов

## Итерация 7 — 2026-04-20
**Фича:** TASK-007 — стратегия хранения accessToken и refreshToken
**Статус:** Завершено
**Что сделано:**
- Зафиксирована стратегия хранения токенов через единый `auth-session` store с `sessionStorage` как основным web-MVP storage и memory fallback при недоступности browser storage
- Добавлены `AuthSessionProvider` и `useAuthSession`, чтобы страницы и будущие фичи работали с session-модулем, а не с деталями хранения
- `users-service` client теперь берёт `Bearer` access token из session store через `resolveAuthHeaders`, не дублируя storage-логику в feature-слое
- На `sign-in` добавлена preview-card для сохранения и очистки session snapshot, чтобы можно было проверить bootstrap и восстановление после reload до реализации полного auth API flow
**Следующие шаги:**
- Перейти к `TASK-008` и собрать отдельный auth API module для `signup`, `signin`, `refresh`, `signout`
**Заметки для следующей итерации:**
- Изолированный прогон store подтвердил сценарий `save -> recreate store -> restore session` через одно и то же хранилище
- Прямые вызовы `sessionStorage` остались только в `entities/auth/model/auth-session-store.ts`, а не в страницах или формах
