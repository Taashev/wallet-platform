import z from 'zod';

export const redisEnvSchema = z.object({
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().int().positive(),
});

export type RedisEnv = z.infer<typeof redisEnvSchema>;

export type RedisConfigType = {
  host: string;
  port: number;
};
