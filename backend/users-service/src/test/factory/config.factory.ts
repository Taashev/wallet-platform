import { ConfigService } from '@nestjs/config';

import {
  AppConfigType,
  AuthConfigType,
  ConfigType,
  DatabaseConfigType,
  SecurityConfigType,
} from '../../infrastructure/config';
import {
  appConfigMock,
  authConfigMock,
  configMock,
  databaseConfigMock,
  securityConfigMock,
} from '../mocks';

export type ConfigServiceMock = jest.Mocked<
  Pick<ConfigService<ConfigType>, 'getOrThrow'>
>;

type CreateConfigMockProps = {
  app?: Partial<AppConfigType>;
  security?: Partial<SecurityConfigType>;
  auth?: {
    accessToken?: Partial<AuthConfigType['accessToken']>;
    refreshToken?: Partial<AuthConfigType['refreshToken']>;
    session?: Partial<AuthConfigType['session']>;
  };
  database?: Partial<DatabaseConfigType>;
};

export const createConfigMock = (
  props: CreateConfigMockProps = {},
): ConfigType => ({
  app: {
    ...appConfigMock,
    ...props.app,
  },
  security: {
    ...securityConfigMock,
    ...props.security,
  },
  auth: {
    accessToken: {
      ...authConfigMock.accessToken,
      ...props.auth?.accessToken,
    },
    refreshToken: {
      ...authConfigMock.refreshToken,
      ...props.auth?.refreshToken,
    },
    session: {
      ...authConfigMock.session,
      ...props.auth?.session,
    },
  },
  database: {
    ...databaseConfigMock,
    ...props.database,
  },
});

export const createConfigServiceMock = (
  config: ConfigType = configMock,
): ConfigServiceMock => {
  const getOrThrow = jest.fn(
    (propertyPath: keyof ConfigType) => config[propertyPath],
  ) as unknown as ConfigServiceMock['getOrThrow'];

  return { getOrThrow };
};
