import { ConfigModuleOptions } from '@nestjs/config';

import { validateConfig } from '.';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: ['.env'],
  validate: validateConfig,
};
