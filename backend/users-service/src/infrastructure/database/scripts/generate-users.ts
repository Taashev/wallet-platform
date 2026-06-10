import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { UserTypeOrmEntity } from '../../../modules/users/database/entities/user-typeorm.entity';
import { SecurityEnv, securityEnvSchema } from '../../config/auth.config';
import { DatabaseEnv, databaseEnvSchema } from '../../config/database.config';
import { getDataSourceOptions } from '../data-source';

const DEFAULT_PASSWORD = '123123123';
const INSERT_BATCH_SIZE = 1_000;

function parseCount(value: string | undefined): number {
  const count = Number(value);

  if (!Number.isSafeInteger(count) || count <= 0) {
    throw new Error(
      'Количество пользователей должно быть положительным целым числом.',
    );
  }

  return count;
}

function createDataSource(databaseEnv: DatabaseEnv): DataSource {
  return new DataSource(
    getDataSourceOptions({
      host: databaseEnv.POSTGRES_HOST,
      port: databaseEnv.POSTGRES_PORT,
      name: databaseEnv.POSTGRES_DB,
      username: databaseEnv.POSTGRES_USER,
      password: databaseEnv.POSTGRES_PASSWORD,
    }),
  );
}

function randomDateOfBirth(): string {
  const start = Date.UTC(1960, 0, 1);
  const end = Date.UTC(2005, 11, 31);
  const timestamp = start + Math.floor(Math.random() * (end - start + 1));

  return new Date(timestamp).toISOString().slice(0, 10);
}

function createUser(
  index: number,
  runId: string,
  passwordHash: string,
): UserTypeOrmEntity {
  const uniqueSuffix = `${runId}_${index}`;

  return {
    userId: randomUUID(),
    username: `user_${uniqueSuffix}`,
    email: `user_${uniqueSuffix}@example.com`,
    password: passwordHash,
    dateOfBirth: randomDateOfBirth(),
    about: `Generated user #${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
}

async function generateUsers(
  dataSource: DataSource,
  count: number,
  passwordHash: string,
): Promise<void> {
  const repository = dataSource.getRepository(UserTypeOrmEntity);
  const runId = `${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;

  for (let offset = 0; offset < count; offset += INSERT_BATCH_SIZE) {
    const batchSize = Math.min(INSERT_BATCH_SIZE, count - offset);
    const users = Array.from({ length: batchSize }, (_, index) =>
      createUser(offset + index, runId, passwordHash),
    );

    await repository.insert(users);
    console.log(`Создано пользователей: ${offset + batchSize}/${count}`);
  }
}

async function main(): Promise<void> {
  dotenv.config({ path: ['.env'] });

  const count = parseCount(process.argv[2]);
  const password = process.argv[3] ?? DEFAULT_PASSWORD;
  const securityEnv: SecurityEnv = securityEnvSchema.parse(process.env);
  const databaseEnv = databaseEnvSchema.parse(process.env);
  const dataSource = createDataSource(databaseEnv);

  try {
    await dataSource.initialize();

    const passwordHash = await bcrypt.hash(password, securityEnv.PASSWORD_SALT);

    await generateUsers(dataSource, count, passwordHash);

    console.log(`Готово. Пароль всех созданных пользователей: ${password}`);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Не удалось сгенерировать пользователей: ${message}`);
  process.exitCode = 1;
});
