import { InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

import { RedisOptions } from 'ioredis';

export type RedisModuleOptionsAsync = {
  inject?: (InjectionToken | OptionalFactoryDependency)[] | undefined;
  useFactory: (...args: any) => RedisOptions | Promise<RedisOptions>;
};
