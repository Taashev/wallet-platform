import {
  AppConfigType,
  AuthConfigType,
  CorsConfigType,
  DatabaseConfigType,
  S3ConfigType,
  SecurityConfigType,
} from '../../infrastructure/config';

export const appEnvironmentMock: AppConfigType['environment'] = 'test';
export const appIsDevMock = true;
export const appHostMock: AppConfigType['host'] = '127.0.0.1';
export const appPortMock: AppConfigType['port'] = 8080;
export const passwordSaltRoundsMock: SecurityConfigType['passwordSaltRounds'] = 10;
export const corsEnabledMock: CorsConfigType['enabled'] = true;
export const corsOriginMock: CorsConfigType['origin'] = [
  'http://localhost:3000',
];
export const corsMethodsMock: CorsConfigType['methods'] = [
  'GET',
  'POST',
  'PATCH',
  'DELETE',
  'OPTIONS',
];
export const corsAllowedHeadersMock: CorsConfigType['allowedHeaders'] = [
  'Content-Type',
  'Authorization',
];
export const corsExposedHeadersMock: CorsConfigType['exposedHeaders'] = [
  'X-Request-Id',
];
export const corsCredentialsMock: CorsConfigType['credentials'] = false;
export const corsMaxAgeMock: CorsConfigType['maxAge'] = 3600;
export const accessTokenSecretMock: AuthConfigType['accessToken']['secret'] =
  'access-secret';
export const refreshTokenSecretMock: AuthConfigType['refreshToken']['secret'] =
  'refresh-secret';
export const accessTokenTTLSecondsMock: AuthConfigType['accessToken']['ttlSeconds'] = 900; // 15m
export const refreshTokenTTLSecondsMock: AuthConfigType['refreshToken']['ttlSeconds'] = 3600; // 60m
export const sessionTTLSecondsMock: AuthConfigType['session']['ttlSeconds'] = 7200; // 120m
export const postgresHostMock: DatabaseConfigType['host'] = 'localhost';
export const postgresPortMock: DatabaseConfigType['port'] = 5432;
export const postgresDbMock: DatabaseConfigType['name'] =
  'wallet_platform_test';
export const postgresUserMock: DatabaseConfigType['username'] = 'postgres';
export const postgresPasswordMock: DatabaseConfigType['password'] = 'postgres';

export const appConfigMock: AppConfigType = {
  environment: appEnvironmentMock,
  host: appHostMock,
  port: appPortMock,
  isDev: appIsDevMock,
};

export const securityConfigMock: SecurityConfigType = {
  passwordSaltRounds: passwordSaltRoundsMock,
};

export const corsConfigMock: CorsConfigType = {
  enabled: corsEnabledMock,
  origin: corsOriginMock,
  methods: corsMethodsMock,
  allowedHeaders: corsAllowedHeadersMock,
  exposedHeaders: corsExposedHeadersMock,
  credentials: corsCredentialsMock,
  maxAge: corsMaxAgeMock,
};

export const authConfigMock: AuthConfigType = {
  accessToken: {
    secret: accessTokenSecretMock,
    ttlSeconds: accessTokenTTLSecondsMock,
  },
  refreshToken: {
    secret: refreshTokenSecretMock,
    ttlSeconds: refreshTokenTTLSecondsMock,
  },
  session: {
    ttlSeconds: sessionTTLSecondsMock,
  },
};

export const databaseConfigMock: DatabaseConfigType = {
  host: postgresHostMock,
  port: postgresPortMock,
  name: postgresDbMock,
  username: postgresUserMock,
  password: postgresPasswordMock,
};

export const s3ConfigMock: S3ConfigType = {
  endpoint: '',
  region: '',
  forcePathStyle: true,
  bucket: '',
  accessKeyId: '',
  secretAccessKey: '',
  uploadPresignedUrlTtlSeconds: 0,
  avatarMaxFileSizeBytes: 0,
};
