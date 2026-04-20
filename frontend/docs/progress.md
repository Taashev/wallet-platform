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
