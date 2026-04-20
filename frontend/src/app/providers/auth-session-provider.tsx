import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { AuthSessionContext } from '@/app/providers/auth-session-context';
import type { AuthSessionStore } from '@/entities/auth/model/auth-session-store';

type AuthSessionProviderProps = PropsWithChildren<{
  store: AuthSessionStore;
}>;

export function AuthSessionProvider({
  children,
  store,
}: AuthSessionProviderProps) {
  useEffect(() => {
    store.setBootstrapStatus(
      store.getSession() ? 'authenticated' : 'unauthenticated',
    );
  }, [store]);

  return (
    <AuthSessionContext.Provider value={store}>
      {children}
    </AuthSessionContext.Provider>
  );
}
