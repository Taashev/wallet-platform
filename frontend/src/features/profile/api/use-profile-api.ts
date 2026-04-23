import { useMemo } from 'react';
import { useUsersServiceHttpClient } from '@/app/providers/use-users-service-http-client';
import { createProfileApi } from '@/features/profile/api/profile-api';

export function useProfileApi() {
  const usersServiceHttpClient = useUsersServiceHttpClient();

  return useMemo(
    () => createProfileApi(usersServiceHttpClient),
    [usersServiceHttpClient],
  );
}
