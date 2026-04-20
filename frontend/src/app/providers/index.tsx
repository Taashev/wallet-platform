import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppConfigErrorScreen } from '@/app/config/app-config-error-screen';
import { AppConfigProvider } from '@/app/providers/app-config-provider';
import { UsersServiceHttpClientProvider } from '@/app/providers/users-service-http-client-provider';
import { createUsersServiceHttpClient } from '@/shared/api/users-service-http-client';
import { createAppConfig } from '@/shared/config/app-config';

export function AppProviders({ children }: PropsWithChildren) {
  const appConfigResult = createAppConfig(import.meta.env);
  const usersServiceApiBaseUrl = appConfigResult.ok
    ? appConfigResult.config.usersService.apiBaseUrl
    : null;
  const usersServiceHttpClient = useMemo(
    () =>
      usersServiceApiBaseUrl
        ? createUsersServiceHttpClient({
            apiBaseUrl: usersServiceApiBaseUrl,
          })
        : null,
    [usersServiceApiBaseUrl],
  );

  if (!appConfigResult.ok) {
    return <AppConfigErrorScreen issue={appConfigResult.issue} />;
  }

  return (
    <AppConfigProvider config={appConfigResult.config}>
      <UsersServiceHttpClientProvider client={usersServiceHttpClient!}>
        <BrowserRouter>{children}</BrowserRouter>
      </UsersServiceHttpClientProvider>
    </AppConfigProvider>
  );
}
