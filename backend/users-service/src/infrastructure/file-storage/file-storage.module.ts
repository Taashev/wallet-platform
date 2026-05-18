import { DynamicModule, Global, Module } from '@nestjs/common';

import { FILE_STORAGE_SERVICE } from './file-storage.keys';
import {
  FILE_STORAGE_SERVICE_PROVIDER,
  S3_CLIENT_PROVIDER,
} from './file-storage.providers';

@Global()
@Module({})
export class FileStorageModule {
  static forRoot(): DynamicModule {
    return {
      module: FileStorageModule,
      providers: [S3_CLIENT_PROVIDER, FILE_STORAGE_SERVICE_PROVIDER],
      exports: [FILE_STORAGE_SERVICE],
    };
  }
}
