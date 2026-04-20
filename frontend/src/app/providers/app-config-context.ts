import { createContext } from 'react';
import type { AppConfig } from '@/shared/config/app-config';

export const AppConfigContext = createContext<AppConfig | null>(null);
