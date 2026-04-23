import z from 'zod';

import {
  DEFAULT_APP_HOST,
  DEFAULT_APP_PORT,
  DEFAULT_CORS_ALLOWED_HEADERS,
  DEFAULT_CORS_CREDENTIALS,
  DEFAULT_CORS_ENABLED,
  DEFAULT_CORS_EXPOSED_HEADERS,
  DEFAULT_CORS_MAX_AGE_SECONDS,
  DEFAULT_CORS_METHODS,
  DEFAULT_PASSWORD_SALT,
  DEFAULT_POSTGRES_HOST,
  DEFAULT_POSTGRES_PORT,
} from '../../shared/constants/config-default-values';

import { corsNormalizedConfig } from './cors-utils';

const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_HOST: z.string().default(DEFAULT_APP_HOST),
  APP_PORT: z.coerce.number().default(DEFAULT_APP_PORT),
});

const corsEnvSchema = z.object({
  CORS_ORIGINS: z.string(),
  CORS_METHODS: z.string().default(DEFAULT_CORS_METHODS),
  CORS_ALLOWED_HEADERS: z.string().default(DEFAULT_CORS_ALLOWED_HEADERS),
  CORS_EXPOSED_HEADERS: z.string().default(DEFAULT_CORS_EXPOSED_HEADERS),
  CORS_CREDENTIALS: z.string().default(DEFAULT_CORS_CREDENTIALS),
  CORS_MAX_AGE_SECONDS: z.string().default(DEFAULT_CORS_MAX_AGE_SECONDS),
  CORS_ENABLED: z.string().default(DEFAULT_CORS_ENABLED),
});

const securityEnvSchema = z.object({
  PASSWORD_SALT: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_PASSWORD_SALT),
});

const authEnvSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive(),
});

const databaseEnvSchema = z.object({
  POSTGRES_HOST: z.string().default(DEFAULT_POSTGRES_HOST),
  POSTGRES_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_POSTGRES_PORT),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
});

type AppEnv = z.infer<typeof appEnvSchema>;
export type CorsEnv = z.infer<typeof corsEnvSchema>;
type SecurityEnv = z.infer<typeof securityEnvSchema>;
type AuthEnv = z.infer<typeof authEnvSchema>;
type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export type AppConfigType = {
  environment: AppEnv['NODE_ENV'];
  host: AppEnv['APP_HOST'];
  port: AppEnv['APP_PORT'];
};

export type CorsConfigType = {
  enabled: boolean;
  origin: string[] | '*';
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
};

export type SecurityConfigType = {
  passwordSaltRounds: SecurityEnv['PASSWORD_SALT'];
};

export type AuthConfigType = {
  accessToken: {
    secret: AuthEnv['ACCESS_TOKEN_SECRET'];
    ttlSeconds: AuthEnv['ACCESS_TOKEN_TTL_SECONDS'];
  };
  refreshToken: {
    secret: AuthEnv['REFRESH_TOKEN_SECRET'];
    ttlSeconds: AuthEnv['REFRESH_TOKEN_TTL_SECONDS'];
  };
  session: {
    ttlSeconds: AuthEnv['SESSION_TTL_SECONDS'];
  };
};

export type DatabaseConfigType = {
  host: DatabaseEnv['POSTGRES_HOST'];
  port: DatabaseEnv['POSTGRES_PORT'];
  name: DatabaseEnv['POSTGRES_DB'];
  username: DatabaseEnv['POSTGRES_USER'];
  password: DatabaseEnv['POSTGRES_PASSWORD'];
};

export type ConfigType = {
  app: AppConfigType;
  cors: CorsConfigType;
  security: SecurityConfigType;
  auth: AuthConfigType;
  database: DatabaseConfigType;
};

export function validateConfig(data: Record<string, any>): ConfigType {
  const appEnv = appEnvSchema.parse(data);
  const corsEnv = corsEnvSchema.parse(data);
  const securityEnv = securityEnvSchema.parse(data);
  const authEnv = authEnvSchema.parse(data);
  const databaseEnv = databaseEnvSchema.parse(data);

  return {
    app: {
      environment: appEnv.NODE_ENV,
      host: appEnv.APP_HOST,
      port: appEnv.APP_PORT,
    },
    cors: corsNormalizedConfig(corsEnv),
    security: {
      passwordSaltRounds: securityEnv.PASSWORD_SALT,
    },
    auth: {
      accessToken: {
        secret: authEnv.ACCESS_TOKEN_SECRET,
        ttlSeconds: authEnv.ACCESS_TOKEN_TTL_SECONDS,
      },
      refreshToken: {
        secret: authEnv.REFRESH_TOKEN_SECRET,
        ttlSeconds: authEnv.REFRESH_TOKEN_TTL_SECONDS,
      },
      session: {
        ttlSeconds: authEnv.SESSION_TTL_SECONDS,
      },
    },
    database: {
      host: databaseEnv.POSTGRES_HOST,
      port: databaseEnv.POSTGRES_PORT,
      name: databaseEnv.POSTGRES_DB,
      username: databaseEnv.POSTGRES_USER,
      password: databaseEnv.POSTGRES_PASSWORD,
    },
  };
}
