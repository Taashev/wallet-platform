import { AppConfigType, appEnvSchema } from './app.config';
import {
  AuthConfigType,
  authEnvSchema,
  SecurityConfigType,
  securityEnvSchema,
} from './auth.config';
import { CorsConfigType, corsEnvSchema } from './cors.config';
import { DatabaseConfigType, databaseEnvSchema } from './database.config';
import { S3ConfigType, s3EnvSchema } from './s3.config';
import { corsNormalizedConfig } from './utils/cors-utils';

export type ConfigType = {
  app: AppConfigType;
  cors: CorsConfigType;
  security: SecurityConfigType;
  auth: AuthConfigType;
  database: DatabaseConfigType;
  s3: S3ConfigType;
};

export function validateConfig(data: Record<string, any>): ConfigType {
  const appEnv = appEnvSchema.parse(data);
  const corsEnv = corsEnvSchema.parse(data);
  const securityEnv = securityEnvSchema.parse(data);
  const authEnv = authEnvSchema.parse(data);
  const databaseEnv = databaseEnvSchema.parse(data);
  const s3Env = s3EnvSchema.parse(data);

  return {
    app: {
      environment: appEnv.NODE_ENV,
      host: appEnv.APP_HOST,
      port: appEnv.APP_PORT,
      isDev: appEnv.NODE_ENV !== 'production' ? true : false,
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
    s3: {
      endpoint: s3Env.S3_URL,
      region: s3Env.S3_REGION,
      accessKeyId: s3Env.S3_ACCESS_KEY,
      secretAccessKey: s3Env.S3_SECRET_KEY,
      bucket: s3Env.S3_BUCKET,
      forcePathStyle: s3Env.S3_FORCE_PATH_STYLE,
      avatarMaxFileSizeBytes: s3Env.S3_AVATAR_MAX_FILE_SIZE_BYTES,
      uploadPresignedUrlTtlSeconds: s3Env.S3_UPLOAD_PRESIGNED_URL_TTL_SECONDS,
    },
  };
}
