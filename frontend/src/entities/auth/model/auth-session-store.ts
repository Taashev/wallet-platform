import type {
  AuthSession,
  AuthSessionSnapshot,
  AuthSessionStorageKind,
} from '@/entities/auth/model/auth-session';

const AUTH_SESSION_STORAGE_KEY = 'wallet-platform.auth-session';

type AuthSessionStoreListener = () => void;

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type AuthSessionStoreOptions = {
  storage?: StorageLike;
  storageKind?: AuthSessionStorageKind;
  storageKey?: string;
};

export type AuthSessionStore = {
  getSnapshot: () => AuthSessionSnapshot;
  getSession: () => AuthSession | null;
  saveSession: (session: AuthSession) => void;
  clearSession: () => void;
  subscribe: (listener: AuthSessionStoreListener) => () => void;
};

export function createAuthSessionStore({
  storage = createBrowserSessionStorage(),
  storageKind = storage ? 'session_storage' : 'memory',
  storageKey = AUTH_SESSION_STORAGE_KEY,
}: AuthSessionStoreOptions = {}): AuthSessionStore {
  let session = readAuthSessionFromStorage(storage, storageKey);
  let snapshot = createAuthSessionSnapshot(session, storageKind);
  const listeners = new Set<AuthSessionStoreListener>();

  function emitChange() {
    listeners.forEach((listener) => listener());
  }

  return {
    getSnapshot() {
      return snapshot;
    },
    getSession() {
      return session;
    },
    saveSession(nextSession) {
      const normalizedSession = normalizeAuthSession(nextSession);
      session = normalizedSession;
      snapshot = createAuthSessionSnapshot(session, storageKind);
      persistAuthSession(storage, storageKey, normalizedSession);
      emitChange();
    },
    clearSession() {
      session = null;
      snapshot = createAuthSessionSnapshot(session, storageKind);
      clearPersistedAuthSession(storage, storageKey);
      emitChange();
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function createAuthSessionSnapshot(
  session: AuthSession | null,
  storageKind: AuthSessionStorageKind,
): AuthSessionSnapshot {
  return {
    session,
    isAuthenticated: session !== null,
    storageKind,
  };
}

function createBrowserSessionStorage() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

function readAuthSessionFromStorage(
  storage: StorageLike | undefined,
  storageKey: string,
) {
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    return normalizeStoredAuthSession(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

function persistAuthSession(
  storage: StorageLike | undefined,
  storageKey: string,
  session: AuthSession,
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(session));
  } catch {
    // Keep the in-memory snapshot even if browser storage writes fail.
  }
}

function clearPersistedAuthSession(
  storage: StorageLike | undefined,
  storageKey: string,
) {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage cleanup failure; the in-memory snapshot is already cleared.
  }
}

function normalizeStoredAuthSession(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<AuthSession>;

  if (
    typeof candidate.accessToken !== 'string' ||
    typeof candidate.refreshToken !== 'string'
  ) {
    return null;
  }

  return normalizeAuthSession({
    accessToken: candidate.accessToken,
    refreshToken: candidate.refreshToken,
  });
}

function normalizeAuthSession(session: AuthSession): AuthSession {
  return {
    accessToken: normalizeRequiredToken(session.accessToken, 'accessToken'),
    refreshToken: normalizeRequiredToken(session.refreshToken, 'refreshToken'),
  };
}

function normalizeRequiredToken(value: string, fieldName: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(`Expected "${fieldName}" to be a non-empty string.`);
  }

  return normalizedValue;
}
