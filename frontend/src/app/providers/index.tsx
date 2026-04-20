import type { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppConfigErrorScreen } from '@/app/config/app-config-error-screen';
import { AppConfigProvider } from '@/app/providers/app-config-provider';
import { createAppConfig } from '@/shared/config/app-config';

export function AppProviders({ children }: PropsWithChildren) {
  const appConfigResult = createAppConfig(import.meta.env);

  if (!appConfigResult.ok) {
    return <AppConfigErrorScreen issue={appConfigResult.issue} />;
  }

  return (
    <AppConfigProvider config={appConfigResult.config}>
      <BrowserRouter>{children}</BrowserRouter>
    </AppConfigProvider>
  );
}
