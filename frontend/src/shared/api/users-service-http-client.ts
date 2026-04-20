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
  defaultRetries?: number;
  fetchFn?: typeof fetch;
};

export function createUsersServiceHttpClient({
  apiBaseUrl,
  resolveAuthHeaders,
  shouldRetry,
  onUnauthorized,
  defaultRetries = 0,
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

  return wrapUsersServiceHttpClient(httpClient, defaultRetries);
}

async function runWithUsersServiceError<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    throw normalizeUsersServiceError(error);
  }
}

function withDefaultRetries(
  defaultRetries: number,
  options?: Omit<HttpRequestOptions, 'method' | 'path'>,
) {
  return {
    ...options,
    retries: options?.retries ?? defaultRetries,
  };
}

function wrapUsersServiceHttpClient(
  httpClient: HttpClient,
  defaultRetries: number,
): UsersServiceHttpClient {
  return {
    request<T>(options: HttpRequestOptions) {
      return runWithUsersServiceError(() =>
        httpClient.request<T>({
          ...options,
          retries: options.retries ?? defaultRetries,
        }),
      );
    },
    get<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() =>
        httpClient.get<T>(path, withDefaultRetries(defaultRetries, options)),
      );
    },
    post<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() =>
        httpClient.post<T>(path, withDefaultRetries(defaultRetries, options)),
      );
    },
    patch<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() =>
        httpClient.patch<T>(path, withDefaultRetries(defaultRetries, options)),
      );
    },
    delete<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>) {
      return runWithUsersServiceError(() =>
        httpClient.delete<T>(path, withDefaultRetries(defaultRetries, options)),
      );
    },
    normalizeError(error: unknown) {
      return normalizeUsersServiceError(error);
    },
  };
}

export type UsersServiceHttpClient = HttpClient & {
  normalizeError(error: unknown): UsersServiceError;
};
