import { useContext, useSyncExternalStore } from 'react';
import { AuthSessionContext } from '@/app/providers/auth-session-context';
import type { AuthSession } from '@/entities/auth/model/auth-session';

export function useAuthSession() {
  const store = useContext(AuthSessionContext);

  if (!store) {
    throw new Error('useAuthSession must be used within AuthSessionProvider.');
  }

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  return {
    ...snapshot,
    saveSession(session: AuthSession) {
      store.saveSession(session);
    },
    clearSession() {
      store.clearSession();
    },
  };
}
