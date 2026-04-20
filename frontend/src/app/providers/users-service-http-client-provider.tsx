import type { PropsWithChildren } from 'react';
import { UsersServiceHttpClientContext } from '@/app/providers/users-service-http-client-context';
import type { UsersServiceHttpClient } from '@/shared/api/users-service-http-client';

type UsersServiceHttpClientProviderProps = PropsWithChildren<{
  client: UsersServiceHttpClient;
}>;

export function UsersServiceHttpClientProvider({
  client,
  children,
}: UsersServiceHttpClientProviderProps) {
  return (
    <UsersServiceHttpClientContext.Provider value={client}>
      {children}
    </UsersServiceHttpClientContext.Provider>
  );
}
