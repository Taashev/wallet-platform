import { useContext } from 'react';
import { UsersServiceHttpClientContext } from '@/app/providers/users-service-http-client-context';

export function useUsersServiceHttpClient() {
  const client = useContext(UsersServiceHttpClientContext);

  if (!client) {
    throw new Error('Users service HTTP client context is not available.');
  }

  return client;
}
