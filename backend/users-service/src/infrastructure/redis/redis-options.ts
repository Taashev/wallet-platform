import { ConfigService } from '@nestjs/config';

import { ConfigType } from '../config';
import { RedisConfigType } from '../config/redis.config';

import { RedisModuleOptionsAsync } from './redis.types';

export const redisModuleOptions: RedisModuleOptionsAsync = {
  inject: [ConfigService],
  useFactory: (config: ConfigService<ConfigType>) => {
    const redisConfig = config.getOrThrow<RedisConfigType>('redis');

    return {
      host: redisConfig.host,
      port: redisConfig.port,
    };
  },
};
