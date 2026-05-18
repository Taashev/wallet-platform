import z from 'zod';

import {
  DEFAULT_CORS_ALLOWED_HEADERS,
  DEFAULT_CORS_CREDENTIALS,
  DEFAULT_CORS_ENABLED,
  DEFAULT_CORS_EXPOSED_HEADERS,
  DEFAULT_CORS_MAX_AGE_SECONDS,
  DEFAULT_CORS_METHODS,
} from '../../shared/constants/config-default-values';

export const corsEnvSchema = z.object({
  CORS_ORIGINS: z.string(),
  CORS_METHODS: z.string().default(DEFAULT_CORS_METHODS),
  CORS_ALLOWED_HEADERS: z.string().default(DEFAULT_CORS_ALLOWED_HEADERS),
  CORS_EXPOSED_HEADERS: z.string().default(DEFAULT_CORS_EXPOSED_HEADERS),
  CORS_CREDENTIALS: z.string().default(DEFAULT_CORS_CREDENTIALS),
  CORS_MAX_AGE_SECONDS: z.string().default(DEFAULT_CORS_MAX_AGE_SECONDS),
  CORS_ENABLED: z.string().default(DEFAULT_CORS_ENABLED),
});

export type CorsEnv = z.infer<typeof corsEnvSchema>;

export type CorsConfigType = {
  enabled: boolean;
  origin: string[] | '*';
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
};
