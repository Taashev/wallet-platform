import { useMemo } from 'react';
import { useUsersServiceHttpClient } from '@/app/providers/use-users-service-http-client';
import { createAuthApi } from '@/features/auth/api/auth-api';

export function useAuthApi() {
  const usersServiceHttpClient = useUsersServiceHttpClient();

  return useMemo(
    () => createAuthApi(usersServiceHttpClient),
    [usersServiceHttpClient],
  );
}
