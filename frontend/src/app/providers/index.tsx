import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppConfigErrorScreen } from '@/app/config/app-config-error-screen';
import { AuthSessionProvider } from '@/app/providers/auth-session-provider';
import { AppConfigProvider } from '@/app/providers/app-config-provider';
import { UsersServiceHttpClientProvider } from '@/app/providers/users-service-http-client-provider';
import { createAuthSessionStore } from '@/entities/auth/model/auth-session-store';
import { createUsersServiceHttpClient } from '@/shared/api/users-service-http-client';
import { createAppConfig } from '@/shared/config/app-config';

export function AppProviders({ children }: PropsWithChildren) {
  const appConfigResult = createAppConfig(import.meta.env);
  const usersServiceApiBaseUrl = appConfigResult.ok
    ? appConfigResult.config.usersService.apiBaseUrl
    : null;
  const authSessionStore = useMemo(() => createAuthSessionStore(), []);
  const usersServiceHttpClient = useMemo(
    () =>
      usersServiceApiBaseUrl
        ? createUsersServiceHttpClient({
            apiBaseUrl: usersServiceApiBaseUrl,
            resolveAuthHeaders: () => {
              const session = authSessionStore.getSession();

              if (!session) {
                return new Headers();
              }

              return new Headers({
                authorization: `Bearer ${session.accessToken}`,
              });
            },
          })
        : null,
    [authSessionStore, usersServiceApiBaseUrl],
  );

  if (!appConfigResult.ok) {
    return <AppConfigErrorScreen issue={appConfigResult.issue} />;
  }

  return (
    <AppConfigProvider config={appConfigResult.config}>
      <AuthSessionProvider store={authSessionStore}>
        <UsersServiceHttpClientProvider client={usersServiceHttpClient!}>
          <BrowserRouter>{children}</BrowserRouter>
        </UsersServiceHttpClientProvider>
      </AuthSessionProvider>
    </AppConfigProvider>
  );
}
