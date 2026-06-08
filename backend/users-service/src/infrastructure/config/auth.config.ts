import z from 'zod';

import { DEFAULT_PASSWORD_SALT } from '../../shared/constants/config-default-values';

export const securityEnvSchema = z.object({
  PASSWORD_SALT: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_PASSWORD_SALT),
});

export const authEnvSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive(),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive(),
});

export type SecurityEnv = z.infer<typeof securityEnvSchema>;
export type AuthEnv = z.infer<typeof authEnvSchema>;

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
