import {
  createHttpClient,
  type HttpClient,
  type HttpRequestOptions,
} from '@/shared/api/http-client';
import {
  normalizeUsersServiceError,
  type UsersServiceError,
} from '@/shared/api/users-service-error';

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
  const httpClient = createHttpClient({
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

  return wrapUsersServiceHttpClient(httpClient);
}

async function runWithUsersServiceError<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    throw normalizeUsersServiceError(error);
  }
}

function wrapUsersServiceHttpClient(httpClient: HttpClient): UsersServiceHttpClient {
  return {
    request<T>(options: HttpRequestOptions) {
      return runWithUsersServiceError(() => httpClient.request<T>(options));
    },
    get<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() => httpClient.get<T>(path, options));
    },
    post<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() => httpClient.post<T>(path, options));
    },
    patch<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() => httpClient.patch<T>(path, options));
    },
    delete<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() => httpClient.delete<T>(path, options));
    },
    normalizeError(error: unknown) {
      return normalizeUsersServiceError(error);
    },
  };
}

export type UsersServiceHttpClient = HttpClient & {
  normalizeError(error: unknown): UsersServiceError;
};
