export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

type QueryParams = Record<string, QueryValue>;

type HeaderResolverContext = {
  attempt: number;
  method: HttpMethod;
  path: string;
};

export type RetryContext = {
  attempt: number;
  method: HttpMethod;
  path: string;
  url: string;
  response?: Response;
  error?: unknown;
};

export type HttpRequestOptions = {
  path: string;
  method?: HttpMethod;
  query?: QueryParams;
  headers?: HeadersInit;
  body?: BodyInit | object | null;
  parseAs?: 'json' | 'text' | 'raw' | 'none';
  signal?: AbortSignal;
  mode?: RequestMode;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  keepalive?: boolean;
  retries?: number;
  retryDelayMs?: number;
  shouldRetry?: (context: RetryContext) => boolean | Promise<boolean>;
  isResponseSuccessful?: (response: Response) => boolean;
};

type HttpClientOptions = {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  resolveHeaders?: (context: HeaderResolverContext) => HeadersInit | Promise<HeadersInit>;
  fetchFn?: typeof fetch;
  shouldRetry?: (context: RetryContext) => boolean | Promise<boolean>;
  retryDelayMs?: number;
  onUnauthorized?: (context: RetryContext) => void | Promise<void>;
};

export class HttpClientError extends Error {
  code: 'network_error' | 'http_error' | 'parse_error';
  method: HttpMethod;
  status?: number;
  url: string;

  constructor(args: {
    code: 'network_error' | 'http_error' | 'parse_error';
    message: string;
    method: HttpMethod;
    status?: number;
    url: string;
  }) {
    super(args.message);
    this.name = 'HttpClientError';
    this.code = args.code;
    this.method = args.method;
    this.status = args.status;
    this.url = args.url;
  }
}

export type HttpClient = {
  request<T>(options: HttpRequestOptions): Promise<T>;
  get<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>): Promise<T>;
  post<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>): Promise<T>;
  patch<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>): Promise<T>;
  delete<T>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'path'>): Promise<T>;
};

function appendQueryParams(url: URL, query?: QueryParams) {
  if (!query) {
    return;
  }

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          url.searchParams.append(key, String(item));
        }
      }

      continue;
    }

    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams) {
  const url = new URL(path.replace(/^\/+/, ''), `${baseUrl}/`);
  appendQueryParams(url, query);
  return url;
}

function mergeHeaders(...headersList: Array<HeadersInit | undefined>) {
  const headers = new Headers();

  for (const candidate of headersList) {
    if (!candidate) {
      continue;
    }

    const normalizedHeaders = new Headers(candidate);
    normalizedHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

async function parseResponse<T>(
  response: Response,
  parseAs: NonNullable<HttpRequestOptions['parseAs']>,
  method: HttpMethod,
  url: string,
) {
  if (parseAs === 'raw') {
    return response as T;
  }

  if (parseAs === 'none') {
    return undefined as T;
  }

  if (parseAs === 'text') {
    return (await response.text()) as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpClientError({
      code: 'parse_error',
      message: 'Failed to parse HTTP response body as JSON.',
      method,
      status: response.status,
      url,
    });
  }
}

function buildRequestBody(body: HttpRequestOptions['body'], headers: Headers) {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  return JSON.stringify(body);
}

export function createHttpClient({
  baseUrl,
  defaultHeaders,
  resolveHeaders,
  fetchFn = fetch,
  shouldRetry: defaultShouldRetry,
  retryDelayMs: defaultRetryDelayMs = 300,
  onUnauthorized,
}: HttpClientOptions): HttpClient {
  async function request<T>({
    path,
    method = 'GET',
    query,
    headers,
    body,
    parseAs = 'json',
    signal,
    mode,
    cache,
    credentials,
    keepalive,
    retries = 0,
    retryDelayMs = defaultRetryDelayMs,
    shouldRetry,
    isResponseSuccessful,
  }: HttpRequestOptions): Promise<T> {
    const url = buildUrl(baseUrl, path, query);
    let attempt = 0;

    while (true) {
      attempt += 1;

      const resolvedHeaders = resolveHeaders
        ? await resolveHeaders({ attempt, method, path })
        : undefined;
      const finalHeaders = mergeHeaders(defaultHeaders, resolvedHeaders, headers);
      const requestBody = buildRequestBody(body, finalHeaders);

      try {
        const response = await fetchFn(url.toString(), {
          method,
          headers: finalHeaders,
          body: requestBody,
          signal,
          mode,
          cache,
          credentials,
          keepalive,
        });

        const responseSuccessful = isResponseSuccessful
          ? isResponseSuccessful(response)
          : response.ok;

        if (response.status === 401 && onUnauthorized) {
          await onUnauthorized({
            attempt,
            method,
            path,
            url: url.toString(),
            response,
          });
        }

        if (!responseSuccessful) {
          const retryContext: RetryContext = {
            attempt,
            method,
            path,
            url: url.toString(),
            response,
          };

          const allowRetry =
            attempt <= retries &&
            Boolean(
              (shouldRetry && (await shouldRetry(retryContext))) ||
                (defaultShouldRetry && (await defaultShouldRetry(retryContext))),
            );

          if (allowRetry) {
            await sleep(retryDelayMs);
            continue;
          }

          throw new HttpClientError({
            code: 'http_error',
            message: `HTTP request failed with status ${response.status}.`,
            method,
            status: response.status,
            url: url.toString(),
          });
        }

        return await parseResponse<T>(response, parseAs, method, url.toString());
      } catch (error) {
        const retryContext: RetryContext = {
          attempt,
          method,
          path,
          url: url.toString(),
          error,
        };

        const isHttpClientError = error instanceof HttpClientError;
        const allowRetry =
          !isHttpClientError &&
          attempt <= retries &&
          Boolean(
            (shouldRetry && (await shouldRetry(retryContext))) ||
              (defaultShouldRetry && (await defaultShouldRetry(retryContext))),
          );

        if (allowRetry) {
          await sleep(retryDelayMs);
          continue;
        }

        if (isHttpClientError) {
          throw error;
        }

        throw new HttpClientError({
          code: 'network_error',
          message:
            error instanceof Error && error.message
              ? error.message
              : 'HTTP request failed before receiving a response.',
          method,
          url: url.toString(),
        });
      }
    }
  }

  return {
    request,
    get(path, options) {
      return request({ ...options, method: 'GET', path });
    },
    post(path, options) {
      return request({ ...options, method: 'POST', path });
    },
    patch(path, options) {
      return request({ ...options, method: 'PATCH', path });
    },
    delete(path, options) {
      return request({ ...options, method: 'DELETE', path });
    },
  };
}
