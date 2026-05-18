import { Inject, Injectable } from '@nestjs/common';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';

@Injectable()
export class GetUploadAvatarUrlUseCase {
  constructor(
    @Inject(FILE_STORAGE_SERVICE) private filesService: IFileStorageService,
  ) {}

  async execute(userId: string, contentType: string) {
    const key = `avatars/${crypto.randomUUID()}`;

    return await this.filesService.getPresignedUploadPost(key, {
      contentType,
      maxFileSizeBytes: 10 * 1024 * 1024,
      expiresInSeconds: 900,
      metadata: { userId },
    });
  }
}
