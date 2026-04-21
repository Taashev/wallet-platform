import { useMemo } from 'react';
import { useUsersServiceHttpClient } from '@/app/providers/use-users-service-http-client';
import { createUsersDirectoryApi } from '@/features/users/api/users-directory-api';

export function useUsersDirectoryApi() {
  const usersServiceHttpClient = useUsersServiceHttpClient();

  return useMemo(
    () => createUsersDirectoryApi(usersServiceHttpClient),
    [usersServiceHttpClient],
  );
}
