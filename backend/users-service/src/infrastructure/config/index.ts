import z from 'zod';

const appConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  APP_HOST: z.string().default('localhost'),
  APP_PORT: z.coerce.number().default(8080),
  PASSWORD_SALT: z.coerce.number().default(10),
});

const authConfigShema = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRE_IN: z.coerce.number(),
  REFRESH_TOKEN_EXPIRE_IN: z.coerce.number(),
});

const databaseConfigSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
});

const schemaList = [
  { name: 'app', schema: appConfigSchema },
  { name: 'auth', schema: authConfigShema },
  { name: 'database', schema: databaseConfigSchema },
];

export type AppConfigType = z.infer<typeof appConfigSchema>;
export type AuthConfigType = z.infer<typeof authConfigShema>;
export type DatabaseConfigType = z.infer<typeof databaseConfigSchema>;

export type ConfigType = {
  app: AppConfigType;
  auth: AuthConfigType;
  database: DatabaseConfigType;
};

export function validateConfig(data: Record<string, any>): ConfigType {
  const config = {} as ConfigType;

  for (const { schema, name } of schemaList) {
    const parsed = schema.safeParse(data);

    if (parsed.error) {
      throw parsed.error;
    }

    config[name] = parsed.data;
  }

  return config;
}
