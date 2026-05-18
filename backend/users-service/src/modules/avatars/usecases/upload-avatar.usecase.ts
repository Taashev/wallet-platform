import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigType, S3ConfigType } from '../../../infrastructure/config';
import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';

@Injectable()
export class GetUploadAvatarUrlUseCase {
  s3Config: S3ConfigType;

  constructor(
    @Inject(FILE_STORAGE_SERVICE) private filesService: IFileStorageService,
    private config: ConfigService<ConfigType>,
  ) {
    this.s3Config = this.config.getOrThrow<S3ConfigType>('s3');
  }

  async execute(userId: string, contentType: string) {
    const key = `avatars/${crypto.randomUUID()}`;

    return await this.filesService.getPresignedUploadPost(key, {
      contentType,
      maxFileSizeBytes: this.s3Config.avatarMaxFileSizeBytes,
      expiresInSeconds: this.s3Config.uploadPresignedUrlTtlSeconds,
      metadata: { userId },
    });
  }
}
