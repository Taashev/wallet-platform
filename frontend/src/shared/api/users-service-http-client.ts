import { createHttpClient } from '@/shared/api/http-client';

type UsersServiceHttpClientOptions = {
  apiBaseUrl: string;
  resolveAuthHeaders?: () => HeadersInit | Promise<HeadersInit>;
  shouldRetry?: Parameters<typeof createHttpClient>[0]['shouldRetry'];
  onUnauthorized?: Parameters<typeof createHttpClient>[0]['onUnauthorized'];
  fetchFn?: typeof fetch;
};

export function createUsersServiceHttpClient({
  apiBaseUrl,
  resolveAuthHeaders,
  shouldRetry,
  onUnauthorized,
  fetchFn,
}: UsersServiceHttpClientOptions) {
  return createHttpClient({
    baseUrl: apiBaseUrl,
    defaultHeaders: {
      accept: 'application/json',
    },
    resolveHeaders: async () => {
      const authHeaders = resolveAuthHeaders ? await resolveAuthHeaders() : undefined;
      return authHeaders ?? {};
    },
    shouldRetry,
    onUnauthorized,
    fetchFn,
  });
}

export type UsersServiceHttpClient = ReturnType<typeof createUsersServiceHttpClient>;
