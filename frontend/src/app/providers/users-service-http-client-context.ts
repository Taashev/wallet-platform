import { createContext } from 'react';
import type { UsersServiceHttpClient } from '@/shared/api/users-service-http-client';

export const UsersServiceHttpClientContext =
  createContext<UsersServiceHttpClient | null>(null);
