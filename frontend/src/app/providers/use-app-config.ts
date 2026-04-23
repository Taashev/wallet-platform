import { useContext } from 'react';
import { AppConfigContext } from '@/app/providers/app-config-context';

export function useAppConfig() {
  const config = useContext(AppConfigContext);

  if (!config) {
    throw new Error('App config context is not available.');
  }

  return config;
}
