import z from 'zod';

const appConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_HOST: z.string().default('localhost'),
  APP_PORT: z.coerce.number().default(8080),
});

const databaseConfigSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
});

export type AppConfigType = z.infer<typeof appConfigSchema>;

export type DatabaseConfigType = z.infer<typeof databaseConfigSchema>;

export type ConfigType = {
  app: AppConfigType;
  database: DatabaseConfigType;
};

export function validateConfig(data: Record<string, any>): ConfigType {
  const appConfig = appConfigSchema.safeParse(data);
  const databaseConfig = databaseConfigSchema.safeParse(data);

  if (appConfig.error) {
    console.error('Ошибка при загрузке параметров приложения');
    throw appConfig.error;
  }

  if (databaseConfig.error) {
    console.error('Ошибка при загрузке параметров базы данных');
    throw databaseConfig.error;
  }

  return {
    app: appConfig.data,
    database: databaseConfig.data,
  };
}
