import z from 'zod';

import type { CorsConfigType, CorsEnv } from '../';

export const envBoolean = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const parseCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const parseCorsOrigins = (
  value: CorsEnv['CORS_ORIGINS'],
): CorsConfigType['origin'] => (value === '*' ? '*' : parseCsv(value));

export const parseCorsMethods = (
  value: CorsEnv['CORS_METHODS'],
): CorsConfigType['methods'] =>
  parseCsv(value).map((item) => item.toUpperCase());

export const parseCorsAllowedHeaders = (
  value: CorsEnv['CORS_ALLOWED_HEADERS'],
): CorsConfigType['allowedHeaders'] => parseCsv(value);

export const parseCorsExposedHeaders = (
  value: CorsEnv['CORS_EXPOSED_HEADERS'],
): CorsConfigType['exposedHeaders'] => parseCsv(value);

export const parseCorsCredentials = (
  value: CorsEnv['CORS_CREDENTIALS'],
): CorsConfigType['credentials'] => envBoolean.parse(value);

export const parseCorsMaxAge = (
  value: CorsEnv['CORS_MAX_AGE_SECONDS'],
): CorsConfigType['maxAge'] => z.coerce.number().int().positive().parse(value);

export const parseCorsEnabled = (
  value: CorsEnv['CORS_ENABLED'],
): CorsConfigType['enabled'] => envBoolean.parse(value);

export const corsNormalizedConfig = (data: CorsEnv): CorsConfigType => ({
  enabled: parseCorsEnabled(data.CORS_ENABLED),
  origin: parseCorsOrigins(data.CORS_ORIGINS),
  methods: parseCorsMethods(data.CORS_METHODS),
  allowedHeaders: parseCorsAllowedHeaders(data.CORS_ALLOWED_HEADERS),
  exposedHeaders: parseCorsExposedHeaders(data.CORS_EXPOSED_HEADERS),
  credentials: parseCorsCredentials(data.CORS_CREDENTIALS),
  maxAge: parseCorsMaxAge(data.CORS_MAX_AGE_SECONDS),
});
