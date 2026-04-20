const USERS_SERVICE_API_ENV_KEYS = [
  'VITE_USERS_SERVICE_API_BASE_URL',
  'VITE_USERS_SERVICE_API_URL',
] as const;

export type AppConfig = {
  usersService: {
    apiBaseUrl: string;
    envKey: (typeof USERS_SERVICE_API_ENV_KEYS)[number];
  };
};

export type AppConfigIssue = {
  code: 'missing_users_service_api_base_url' | 'invalid_users_service_api_base_url';
  envKeys: readonly string[];
  message: string;
  receivedValue?: string;
};

export type AppConfigResult =
  | { ok: true; config: AppConfig }
  | { ok: false; issue: AppConfigIssue };

function normalizeBaseUrl(url: URL) {
  return url.toString().replace(/\/+$/, '');
}

function validateUsersServiceApiBaseUrl(value: string) {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return normalizeBaseUrl(url);
  } catch {
    return null;
  }
}

export function createAppConfig(env: ImportMetaEnv): AppConfigResult {
  for (const envKey of USERS_SERVICE_API_ENV_KEYS) {
    const rawValue = env[envKey];

    if (!rawValue) {
      continue;
    }

    const normalizedValue = validateUsersServiceApiBaseUrl(rawValue);

    if (!normalizedValue) {
      return {
        ok: false,
        issue: {
          code: 'invalid_users_service_api_base_url',
          envKeys: USERS_SERVICE_API_ENV_KEYS,
          message: 'Users service API base URL must be a valid absolute http(s) URL.',
          receivedValue: rawValue,
        },
      };
    }

    return {
      ok: true,
      config: {
        usersService: {
          apiBaseUrl: normalizedValue,
          envKey,
        },
      },
    };
  }

  return {
    ok: false,
    issue: {
      code: 'missing_users_service_api_base_url',
      envKeys: USERS_SERVICE_API_ENV_KEYS,
      message: 'Users service API base URL is missing from the frontend environment configuration.',
    },
  };
}

export function resolveUsersServiceUrl(apiBaseUrl: string, path: string) {
  return new URL(path.replace(/^\/+/, ''), `${apiBaseUrl}/`).toString();
}
