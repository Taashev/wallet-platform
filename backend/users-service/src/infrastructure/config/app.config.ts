import z from 'zod';

import {
  DEFAULT_APP_HOST,
  DEFAULT_APP_PORT,
} from '../../shared/constants/config-default-values';

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_HOST: z.string().default(DEFAULT_APP_HOST),
  APP_PORT: z.coerce.number().default(DEFAULT_APP_PORT),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export type AppConfigType = {
  environment: AppEnv['NODE_ENV'];
  host: AppEnv['APP_HOST'];
  port: AppEnv['APP_PORT'];
  isDev: boolean;
};
