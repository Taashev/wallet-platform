import { DynamicModule, Global, Module, Provider } from '@nestjs/common';

import Redis, { RedisOptions } from 'ioredis';

import {
  REDIS_CLIENT,
  REDIS_MODULE_OPTIONS,
  REDIS_SERVICE,
} from './redis.keys';
import { RedisService } from './redis.service';
import { RedisModuleOptionsAsync } from './redis.types';

@Global()
@Module({
  providers: [{ provide: REDIS_SERVICE, useClass: RedisService }],
  exports: [REDIS_SERVICE],
})
export class RedisModule {
  static forRootAsync(options: RedisModuleOptionsAsync): DynamicModule {
    const configProvider: Provider = {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };

    const redisClientProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: (config: RedisOptions) => {
        const redisInstance = new Redis(config);

        redisInstance.on('error', (error) => {
          throw new Error(`Ошибка при подлючении к redis ${error}`);
        });

        return redisInstance;
      },
      inject: [REDIS_MODULE_OPTIONS],
    };

    return {
      module: RedisModule,
      providers: [configProvider, redisClientProvider],
      exports: [REDIS_CLIENT],
      global: true,
    };
  }
}
