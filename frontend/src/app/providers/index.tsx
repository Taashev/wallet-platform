import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppConfigErrorScreen } from '@/app/config/app-config-error-screen';
import { AuthSessionProvider } from '@/app/providers/auth-session-provider';
import { AppConfigProvider } from '@/app/providers/app-config-provider';
import { UsersServiceHttpClientProvider } from '@/app/providers/users-service-http-client-provider';
import { createAuthSessionStore } from '@/entities/auth/model/auth-session-store';
import { createAuthApi } from '@/features/auth/api/auth-api';
import { createRefreshSessionOrchestrator } from '@/features/auth/model/refresh-session-orchestrator';
import { createUsersServiceHttpClient } from '@/shared/api/users-service-http-client';
import { createAppConfig } from '@/shared/config/app-config';

export function AppProviders({ children }: PropsWithChildren) {
  const appConfigResult = createAppConfig(import.meta.env);
  const usersServiceApiBaseUrl = appConfigResult.ok
    ? appConfigResult.config.usersService.apiBaseUrl
    : null;
  const authSessionStore = useMemo(() => createAuthSessionStore(), []);
  const resolveAuthHeaders = useMemo(
    () => () => {
      const session = authSessionStore.getSession();

      if (!session) {
        return new Headers();
      }

      return new Headers({
        authorization: `Bearer ${session.accessToken}`,
      });
    },
    [authSessionStore],
  );
  const authApiHttpClient = useMemo(
    () =>
      usersServiceApiBaseUrl
        ? createUsersServiceHttpClient({
            apiBaseUrl: usersServiceApiBaseUrl,
            resolveAuthHeaders,
          })
        : null,
    [resolveAuthHeaders, usersServiceApiBaseUrl],
  );
  const authApi = useMemo(
    () => (authApiHttpClient ? createAuthApi(authApiHttpClient) : null),
    [authApiHttpClient],
  );
  const refreshSessionOrchestrator = useMemo(
    () =>
      authApi
        ? createRefreshSessionOrchestrator({
            authApi,
            authSessionStore,
          })
        : null,
    [authApi, authSessionStore],
  );
  const usersServiceHttpClient = useMemo(
    () =>
      usersServiceApiBaseUrl
        ? createUsersServiceHttpClient({
            apiBaseUrl: usersServiceApiBaseUrl,
            defaultRetries: 1,
            onUnauthorized: refreshSessionOrchestrator?.handleUnauthorized,
            resolveAuthHeaders,
            shouldRetry: refreshSessionOrchestrator?.shouldRetry,
          })
        : null,
    [refreshSessionOrchestrator, resolveAuthHeaders, usersServiceApiBaseUrl],
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
