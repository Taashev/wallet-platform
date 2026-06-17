import z from 'zod';

import {
  DEFAULT_POSTGRES_HOST,
  DEFAULT_POSTGRES_PORT,
} from '../../shared/constants/config-default-values';

export const databaseEnvSchema = z.object({
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

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

export type DatabaseConfigType = {
  host: DatabaseEnv['POSTGRES_HOST'];
  port: DatabaseEnv['POSTGRES_PORT'];
  name: DatabaseEnv['POSTGRES_DB'];
  username: DatabaseEnv['POSTGRES_USER'];
  password: DatabaseEnv['POSTGRES_PASSWORD'];
};
