import { Inject, Injectable } from '@nestjs/common';

import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';
import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_BASE_PATH_STORAGE,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_MIN_SIZE_BYTES,
  AVATAR_STATUSES,
} from '../constants/avatar-constants';
import { AVATARS_REPOSITORY } from '../constants/avatar.keys';
import type { AvatarsRepository } from '../interfaces/avatars-repository.interface';
import { AvatarMimeType, AvatarStatus } from '../types/avatar.type';

const OUTPUT_MIME_TYPE = 'image/webp';
const OUTPUT_SIZE = 512;
const OUTPUT_QUALITY = 80;
const MAX_INPUT_PIXELS = 25_000_000;

@Injectable()
export class ProcessAvatarUseCase {
  constructor(
    @Inject(AVATARS_REPOSITORY)
    private avatarsRepository: AvatarsRepository,
    @Inject(FILE_STORAGE_SERVICE)
    private fileService: IFileStorageService,
    private transactionService: TransactionService,
  ) {}

  async execute(avatarId: string, userId: string, retry: boolean) {
    const acquired = await this.avatarsRepository.update(
      { avatarId, currentStatus: AVATAR_STATUSES.uploaded },
      { status: AVATAR_STATUSES.processing },
    );

    if (!acquired) {
      return;
    }

    try {
      const avatar = await this.avatarsRepository.getByAvatarId(avatarId, {
        userId,
      });

      if (avatar === null) {
        throw new Error('Аватар не найден');
      }

      const image = await this.fileService.getFile(avatar.storageKey);

      if (!(await this.validateImage(avatarId, image.body))) {
        return;
      }

      const normalizedImage = await this.normalizeImage(image.body);
      const avatarStorageKey = AVATAR_BASE_PATH_STORAGE + avatarId;

      await this.fileService.upload({
        key: avatarStorageKey,
        body: normalizedImage,
        contentType: OUTPUT_MIME_TYPE,
        metadata: { avatarId, userId },
      });

      await this.transactionService.run(async () => {
        await this.avatarsRepository.update(
          { userId, current: true },
          { current: false },
        );

        const completed = await this.avatarsRepository.update(
          {
            avatarId,
            userId,
            currentStatus: AVATAR_STATUSES.processing,
          },
          {
            current: true,
            status: AVATAR_STATUSES.ready,
            storageKey: avatarStorageKey,
            mimeType: OUTPUT_MIME_TYPE,
            sizeBytes: normalizedImage.length,
          },
        );

        if (!completed) {
          await this.fileService.delete(avatarStorageKey);

          throw new Error('Не удалось обновить данные аватара в БД');
        }
      });
    } catch (error) {
      await this.handleFailure(avatarId, retry, error);

      throw error;
    }
  }

  private async validateImage(
    avatarId: string,
    body: Buffer,
  ): Promise<boolean> {
    const isValidSize =
      body.length >= AVATAR_MIN_SIZE_BYTES &&
      body.length <= AVATAR_MAX_SIZE_BYTES;

    if (!isValidSize) {
      await this.reject(avatarId);
      return false;
    }

    const fileType = await fileTypeFromBuffer(body);

    const isAllowedType =
      fileType !== undefined &&
      AVATAR_ALLOWED_MIME_TYPES.includes(fileType.mime as AvatarMimeType);

    if (!isAllowedType) {
      await this.reject(avatarId);
      return false;
    }

    return true;
  }

  private normalizeImage(body: Buffer): Promise<Buffer> {
    return sharp(body, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { fit: 'cover' })
      .webp({ quality: OUTPUT_QUALITY })
      .toBuffer();
  }

  private async reject(avatarId: string): Promise<void> {
    await this.updateStatus(
      avatarId,
      AVATAR_STATUSES.rejected,
      AVATAR_STATUSES.processing,
    );
  }

  private async handleFailure(
    avatarId: string,
    retry: boolean,
    cause: unknown,
  ): Promise<void> {
    const nextStatus = retry
      ? AVATAR_STATUSES.uploaded
      : AVATAR_STATUSES.failed;

    try {
      await this.updateStatus(avatarId, nextStatus, AVATAR_STATUSES.processing);
    } catch {
      throw new Error('Не удалось обновить статус аватара после ошибки', {
        cause,
      });
    }
  }

  private async updateStatus(
    avatarId: string,
    status: AvatarStatus,
    currentStatus: AvatarStatus,
  ): Promise<void> {
    const updated = await this.avatarsRepository.update(
      { avatarId, currentStatus },
      { status },
    );

    if (!updated) {
      throw new Error(`Не удалось изменить статус аватара на "${status}"`);
    }
  }
}
