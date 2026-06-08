import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';

import { ConfigType, S3ConfigType } from '../config';

import { FILE_STORAGE_SERVICE, S3_CLIENT } from './file-storage.keys';
import { FileStorageService } from './file-storage.service';

export const FILE_STORAGE_SERVICE_PROVIDER: Provider = {
  provide: FILE_STORAGE_SERVICE,
  useClass: FileStorageService,
};

export const S3_CLIENT_PROVIDER: Provider = {
  provide: S3_CLIENT,
  useFactory: async (config: ConfigService<ConfigType>) => {
    const s3Config = config.getOrThrow<S3ConfigType>('s3');

    const s3Client = new S3Client({
      // Адрес S3-совместимого хранилища, например MinIO
      endpoint: s3Config.endpoint,
      // Регион нужен AWS SDK для подписи запросов; для MinIO может быть условным
      region: s3Config.region,
      // Для MinIO обычно нужен path-style URL: /bucket/key вместо bucket.host/key
      forcePathStyle: s3Config.forcePathStyle,
      credentials: {
        // Публичный идентификатор доступа к хранилищу
        accessKeyId: s3Config.accessKeyId,
        // Секретный ключ для подписи запросов к хранилищу
        secretAccessKey: s3Config.secretAccessKey,
      },
    });

    await s3Client.send(new HeadBucketCommand({ Bucket: s3Config.bucket }));

    return s3Client;
  },
  inject: [ConfigService],
};
