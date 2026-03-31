import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import { ConfigType, DatabaseConfigType } from '../config';

import { getDataSourceOptions } from './data-source';

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  useFactory: (config: ConfigService<ConfigType>) => {
    const databaseConfig = config.getOrThrow<DatabaseConfigType>('database');

    return getDataSourceOptions(databaseConfig);
  },
  inject: [ConfigService],
};
