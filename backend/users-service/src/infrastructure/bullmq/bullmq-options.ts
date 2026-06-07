import { SharedBullAsyncConfiguration } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

import { ConfigType } from '../config';
import { RedisConfigType } from '../config/redis.config';

export const bullmqModuleOptions: SharedBullAsyncConfiguration = {
  useFactory: (configService: ConfigService<ConfigType>) => {
    const redisConfig = configService.getOrThrow<RedisConfigType>('redis');

    return {
      connection: { host: redisConfig.host, port: redisConfig.port },
    };
  },
  inject: [ConfigService],
};
