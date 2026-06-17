import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';

import type { IFileStorageService } from './file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from './file-storage/file-storage.keys';

@Controller()
export class AppController {
  constructor(
    @Inject(FILE_STORAGE_SERVICE)
    private fileStorageService: IFileStorageService,
  ) {}

  @Get('health')
  async health() {
    try {
      await this.fileStorageService.checkConnection();
    } catch {
      throw new ServiceUnavailableException('File storage is unavailable');
    }

    return { status: 'ok' };
  }
}
