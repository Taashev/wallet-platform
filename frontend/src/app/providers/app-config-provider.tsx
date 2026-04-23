import type { PropsWithChildren } from 'react';
import { AppConfigContext } from '@/app/providers/app-config-context';
import type { AppConfig } from '@/shared/config/app-config';

type AppConfigProviderProps = PropsWithChildren<{
  config: AppConfig;
}>;

export function AppConfigProvider({
  config,
  children,
}: AppConfigProviderProps) {
  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}
