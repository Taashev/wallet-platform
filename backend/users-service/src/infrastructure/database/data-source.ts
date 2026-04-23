import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

import { DatabaseConfigType } from '../config';

export function getDataSourceOptions(
  options: DatabaseConfigType,
): DataSourceOptions {
  return {
    type: 'postgres',
    url: `postgres://${options.username}:${options.password}@${options.host}:${options.port}/${options.name}`,
    synchronize: false,
    migrationsRun: false,
    entities: [join(__dirname, '../../**/*.entity.{ts,js}')],
    migrations: [join(__dirname, './migrations/*.{ts,js}')],
  };
}
