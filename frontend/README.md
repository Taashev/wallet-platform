# Users Service Web MVP

## Commands

- `npm install`
- `npm run dev`
- `npm run check`

## Environment

Create `frontend/.env` with one of the supported API base URL variables:

```env
VITE_USERS_SERVICE_API_BASE_URL=http://127.0.0.1:8080
```

Legacy fallback is also supported:

```env
VITE_USERS_SERVICE_API_URL=http://127.0.0.1:8080
```

The frontend validates this URL at startup and uses it for the users-service connectivity probe.
