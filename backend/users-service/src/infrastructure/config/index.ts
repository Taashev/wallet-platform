import z from 'zod';

const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_HOST: z.string().default('localhost'),
  APP_PORT: z.coerce.number().default(8080),
});

const securityEnvSchema = z.object({
  PASSWORD_SALT: z.coerce.number().int().positive().default(10),
});

const authEnvSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive(),
});

const databaseEnvSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
});

type AppEnv = z.infer<typeof appEnvSchema>;
type SecurityEnv = z.infer<typeof securityEnvSchema>;
type AuthEnv = z.infer<typeof authEnvSchema>;
type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export type AppConfigType = {
  environment: AppEnv['NODE_ENV'];
  host: AppEnv['APP_HOST'];
  port: AppEnv['APP_PORT'];
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
  security: SecurityConfigType;
  auth: AuthConfigType;
  database: DatabaseConfigType;
};

export function validateConfig(data: Record<string, any>): ConfigType {
  const appEnv = appEnvSchema.parse(data);
  const securityEnv = securityEnvSchema.parse(data);
  const authEnv = authEnvSchema.parse(data);
  const databaseEnv = databaseEnvSchema.parse(data);

  return {
    app: {
      environment: appEnv.NODE_ENV,
      host: appEnv.APP_HOST,
      port: appEnv.APP_PORT,
    },
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
