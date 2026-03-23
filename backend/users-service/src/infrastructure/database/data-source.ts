import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

import { DatabaseConfigType } from '../config';

export function getDataSourceOptions(
  options: DatabaseConfigType,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: `postgres://${options.POSTGRES_USER}:${options.POSTGRES_PASSWORD}@${options.POSTGRES_HOST}:${options.POSTGRES_PORT}/${options.POSTGRES_DB}`,
    synchronize: false,
    migrationsRun: false,
    entities: [join(__dirname, '../../**/*.entity.{ts,js}')],
    migrations: [join(__dirname, './migrations/*.{ts,js}')],
  };
}
