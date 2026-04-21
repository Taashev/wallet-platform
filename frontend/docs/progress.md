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

## Итерация 8 — 2026-04-20
**Фича:** TASK-008 — auth API module для signup, signin, refresh и signout
**Статус:** Завершено
**Что сделано:**
- Добавлен отдельный auth integration-слой с методами `signup`, `signin`, `refresh`, `signout`, построенный поверх единого `users-service` client и contract layer
- Добавлен `useAuthApi`, чтобы экранные модули работали с auth abstraction, а не с raw HTTP-запросами
- На `sign-in` подключена preview-card, использующая auth API для `refresh` и `signout` и показывающая, что экранный слой не знает деталей запросов
- Прямые обращения к `/v1/auth/*` теперь сосредоточены только в одном auth module
**Следующие шаги:**
- Перейти к `TASK-009` и собрать refresh orchestration с single-flight и fail-closed logout поверх уже готового auth API module
**Заметки для следующей итерации:**
- Локальная проверка against `http://127.0.0.1:8080` подтвердила реальный проход `signup -> signin -> refresh -> signout` через новый auth module
- Для доступа к localhost из этой среды потребовался escalated local execution; сам frontend-код после этого не менялся

## Итерация 9 — 2026-04-20
**Фича:** TASK-009 — refresh orchestration с single-flight и fail-closed logout
**Статус:** Завершено
**Что сделано:**
- Добавлен `refresh-session-orchestrator`, который централизованно обрабатывает `401`, запускает refresh только один раз на волну запросов и отдаёт результат в retry-логику общего HTTP-клиента
- `users-service` client получил `defaultRetries`, а `AppProviders` теперь поднимают два слоя: auth API client для refresh/signout и общий protected client с auto-refresh orchestration
- На `Profile` добавлена protected session probe card, которая вызывает `GET /v1/users/me` через общий client и позволяет увидеть automatic refresh/retry на защищённом маршруте
- При неуспешном refresh локальная сессия очищается через session store, что даёт fail-closed поведение без размазывания logout-логики по экранам
**Следующие шаги:**
- Перейти к `TASK-010` и собрать bootstrap auth-state и guard-логику для публичных и защищённых маршрутов
**Заметки для следующей итерации:**
- Локальный прогон against `http://127.0.0.1:8080` подтвердил single-flight: две конкурентные protected `401`-запроса дали ровно один `refresh`
- Отдельный сценарий с невалидным `refreshToken` подтвердил очистку локальной сессии и итоговый `401 unauthorized`

## Итерация 10 — 2026-04-20
**Фича:** TASK-010 — bootstrap auth-сессии и guard-логика маршрутов
**Статус:** Завершено
**Что сделано:**
- В `auth-session` snapshot добавлены явные bootstrap-поля, чтобы приложение различало восстановление сессии, авторизованное и неавторизованное состояния
- `AuthSessionProvider` теперь завершает bootstrap при старте приложения, а `PublicLayout` и `ProtectedLayout` ждут это состояние перед редиректами
- Добавлен route guard для защищённых маршрутов с возвратом неавторизованного пользователя на `/sign-in` и обратный redirect авторизованного пользователя с публичных auth-страниц
- Обновлены Playwright-сценарии для проверки `protected -> sign-in`, `sign-in -> profile` и восстановления сессии после `reload`
- Исправлен `eslint` ignore для `Playwright` артефактов, чтобы quality-check не падал на служебных директориях
**Следующие шаги:**
- Перейти к `TASK-011` и собрать общий набор form primitives для auth и profile flow
**Заметки для следующей итерации:**
- Текущий bootstrap intentionally опирается на persisted frontend session snapshot и guard-логику роутера, без дополнительного сетевого refresh на старте
- Проверки `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно; для Playwright потребовался escalated local execution из-за sandbox-ограничения на локальный порт

## Итерация 11 — 2026-04-20
**Фича:** TASK-011 — общий набор form primitives и UI-состояний
**Статус:** Завершено
**Что сделано:**
- Добавлены общие form primitives в `shared/ui`: текстовое поле, textarea-вариант, submit-button и feedback block для состояний `loading`, `error`, `empty`, `success`
- В `app/styles/index.css` добавлены единые стили для form controls, action rows, feedback blocks и mobile-поведения этих элементов
- Демонстрация primitives встроена только в `sign-in` и `sign-up`, как согласовано для текущей итерации, без расширения на protected-экраны
- Playwright smoke-проверки расширены так, чтобы проверять наличие общих auth-form элементов и feedback-состояний на публичных auth-маршрутах
**Следующие шаги:**
- Перейти к `TASK-012` и подключить реальный flow `sign in / sign up / sign out` поверх уже готовых auth primitives
**Заметки для следующей итерации:**
- Хотя demo сейчас ограничен `sign-in` и `sign-up`, primitives уже вынесены в `shared/ui` и готовы для повторного использования в profile/users flow без копирования разметки
- Проверки `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно; для Playwright потребовался escalated local execution из-за sandbox-ограничения на локальный порт

## Итерация 12 — 2026-04-20
**Фича:** TASK-012 — пользовательский flow входа, регистрации и выхода
**Статус:** Завершено
**Что сделано:**
- `sign-in` и `sign-up` переведены с preview-сценариев на реальные формы с controlled inputs, submit flow, loading/error состояниями и использованием общего `authApi`
- После успешных `signin` и `signup` auth-session сохраняется через существующий session store, а пользователь переводится в защищённую зону
- В защищённый layout добавлено действие `Sign out`, которое вызывает `auth/signout` и очищает локальную сессию с возвратом на публичный маршрут
- Общие form primitives расширены для controlled form usage, чтобы их можно было переиспользовать в следующих profile-задачах без нового UI-слоя
- Playwright smoke-сценарии переписаны под реальные browser flow `sign in`, `sign up`, `sign out` вместо старых preview-проверок
**Следующие шаги:**
- Перейти к `TASK-013` и собрать верхнюю навигацию и адаптивный layout для защищённой зоны с учётом уже добавленного `Sign out`
**Заметки для следующей итерации:**
- `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно
- Дополнительно выполнена живая локальная проверка against `127.0.0.1:8080`: `signup -> signin -> signout` отрабатывают успешно через реальные backend endpoints

## Итерация 13 — 2026-04-21
**Фича:** TASK-013 — верхняя навигация и адаптивный protected layout
**Статус:** Завершено
**Что сделано:**
- Protected shell переведён с боковой навигации на верхний app bar с основными действиями `Profile`, `Users`, `Sign out`
- Основная навигация упрощена до маршрутов, заявленных в задаче, при этом secondary маршруты `edit/password/delete` остаются доступны из самих экранов
- Layout обновлён под mobile-friendly поведение: верхняя навигация и sign-out action корректно перестраиваются на узких экранах
- Smoke e2e расширены проверкой protected navigation, перехода `Profile -> Users` и сохранения работоспособности layout после смены viewport на mobile width
**Следующие шаги:**
- Перейти к `TASK-014` и вынести profile API операции в отдельный integration-модуль
**Заметки для следующей итерации:**
- `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно
- Основной protected navigation intentionally ограничен `Profile / Users / Sign out`, чтобы не смешивать primary app shell с secondary account actions следующих задач

## Итерация 14 — 2026-04-21
**Фича:** TASK-014 — profile API module
**Статус:** Завершено
**Что сделано:**
- Добавлен отдельный `profile API` integration-слой с операциями `getCurrentProfile`, `updateCurrentProfile`, `changePassword`, `deleteCurrentProfile`
- Новый модуль построен поверх существующего `users-service` client и current-user contract normalizers, без ручной HTTP-логики в страницах
- Добавлен `useProfileApi`, чтобы экранный слой следующих задач работал с profile integration через единый hook, а не напрямую с HTTP client
- Реальный локальный smoke against backend подтвердил `GET /v1/users/me`, `PATCH /v1/users/me`, `PATCH /v1/users/me/password` и `DELETE /v1/users/me`
**Следующие шаги:**
- Перейти к `TASK-015` и собрать экран просмотра собственного профиля поверх уже готового profile API module
**Заметки для следующей итерации:**
- `npm run lint` и `npm run build` прошли успешно
- Локальная проверка показала важный контрактный нюанс: после смены пароля старый `accessToken` больше не подходит для `DELETE /v1/users/me`, поэтому destructive flow должен учитывать re-auth/новую сессию в следующих задачах

## Итерация 15 — 2026-04-21
**Фича:** TASK-015 — экран просмотра собственного профиля
**Статус:** Завершено
**Что сделано:**
- `Profile` page переведён с preview-контента на реальный read-only экран, который загружает текущего пользователя через `useProfileApi`
- Добавлены явные `loading` и `error` состояния вместо пустого экрана, а успешный сценарий показывает username, email, about, dateOfBirth и age
- Данные рендерятся через безопасные fallback-значения для отсутствующих полей, чтобы UI не ломался на пустых или спорных значениях
- Обновлены Playwright smoke-проверки: подтверждён happy-path загрузки профиля и recoverable error state при неуспешном `GET /v1/users/me`
**Следующие шаги:**
- Перейти к `TASK-016` и собрать edit profile экран поверх уже готового profile API module
**Заметки для следующей итерации:**
- `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно
- Локальный backend smoke подтвердил реальный `GET /v1/users/me`; текущий backend по умолчанию возвращает fallback-значения вроде `about: "Пока ничего не рассказал о себе"` и `dateOfBirth: "1970-01-01"`, поэтому UI следующих profile-задач должен учитывать, что часть данных может быть technically present, но по смыслу выглядеть как placeholder

## Итерация 16 — 2026-04-21
**Фича:** TASK-016 — экран редактирования профиля
**Статус:** Завершено
**Что сделано:**
- `profile/edit` переведён с preview на реальную форму редактирования `username`, `email`, `about`, `dateOfBirth` поверх `PATCH /v1/users/me`
- Добавлен небольшой shared current-profile store, чтобы после успешного сохранения обновлённые данные сразу отражались на `Profile` без ручного reload
- На edit screen добавлены inline validation errors, form-level save error state и redirect обратно на `Profile` с success feedback после сохранения
- Profile cache очищается вместе со сбросом auth-session, чтобы не протекали данные предыдущего пользователя между sign-in/sign-out и fail-closed refresh logout
- Playwright e2e расширены сценариями успешного edit/save flow и отображения validation/save errors рядом с формой
**Следующие шаги:**
- Перейти к `TASK-017` и реализовать отдельный экран смены пароля с локальной валидацией и понятным success/error feedback
**Заметки для следующей итерации:**
- `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно
- Для Playwright снова потребовался escalated local execution из-за sandbox-ограничения на локальный порт для Vite web server

## Итерация 17 — 2026-04-21
**Фича:** TASK-017 — security flow и BankDash-inspired redesign
**Статус:** Завершено
**Что сделано:**
- Protected shell переведён на новый visual direction по мотивам Figma-макета: `Inter`, светлая banking-палитра, sidebar `Home / Settings`, topbar с search/actions и новые dashboard-style panels
- Public auth layout и текущие рабочие экраны `sign-in`, `sign-up`, `Home (/profile)`, `Settings (/profile/edit, /profile/password)` переписаны с использованием нового набора UI-примитивов вместо старого chunky UI-слоя
- Реализован настоящий `Security` tab на `/profile/password` с локальной валидацией `oldPassword/newPassword`, success/error feedback и интеграцией с `PATCH /v1/users/me/password`
- Edit profile flow сохранён и встроен в новый settings-layout; обновлённый current-profile store продолжает синхронно обновлять `Home` без reload
- Playwright e2e синхронизированы с новым shell и дополнены browser flow `change password -> sign out -> sign in with new password`
**Следующие шаги:**
- Перейти к `TASK-018` и собрать confirm-flow удаления аккаунта в уже обновлённом settings-area
**Заметки для следующей итерации:**
- `npm run lint`, `npm run build` и `npm run test:e2e` прошли успешно
- Figma MCP дал достаточно контекста для shell/settings typography и palette, но дальнейшие детальные чтения упёрлись в rate limit Starter plan; оставшийся polish лучше делать уже по локальному code review и живому UI
