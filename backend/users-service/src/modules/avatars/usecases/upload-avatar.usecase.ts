import { Inject, Injectable } from '@nestjs/common';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';
import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { ValidationError } from '../../../shared/errors';
import { USERS_REPOSITORY } from '../../users/constants/users.keys';
import type { UsersRepository } from '../../users/interfaces/users-repository.interface';
import {
  AVATAR_BASE_PATH_STORAGE_TMP,
  AVATAR_MAX_COUNT_PER_USER,
  AVATAR_STATUSES,
} from '../constants/avatar-constants';
import { AVATARS_REPOSITORY } from '../constants/avatar.keys';
import type { AvatarsRepository } from '../interfaces/avatars-repository.interface';
import { AvatarProducer } from '../producers/avatar.producer';
import type { AvatarStatus } from '../types/avatar.type';

@Injectable()
export class UploadAvatarUseCase {
  constructor(
    @Inject(AVATARS_REPOSITORY) private avatarsRepository: AvatarsRepository,
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    @Inject(FILE_STORAGE_SERVICE) private filesService: IFileStorageService,
    private transactionService: TransactionService,
    private avatarProducer: AvatarProducer,
  ) {}

  async execute(userId: string, file: Express.Multer.File) {
    const avatarId = crypto.randomUUID();
    const storageKey = AVATAR_BASE_PATH_STORAGE_TMP + avatarId;

    await this.createPendingAvatar(avatarId, userId, storageKey, file);
    await this.uploadFile(avatarId, userId, storageKey, file);
    await this.markAsUploaded(avatarId);
    await this.avatarProducer.sendUploadAvatar(avatarId, { avatarId, userId });

    return { avatarId, status: AVATAR_STATUSES.uploaded };
  }

  private async createPendingAvatar(
    avatarId: string,
    userId: string,
    storageKey: string,
    file: Express.Multer.File,
  ): Promise<void> {
    await this.transactionService.run(async () => {
      await this.usersRepository.lockById(userId, { nowait: true });

      const activeCount =
        await this.avatarsRepository.getCountAvatarsByUserId(userId);

      if (activeCount >= AVATAR_MAX_COUNT_PER_USER) {
        throw new ValidationError({
          message: 'Лимит на загрузку файлов',
          expose: true,
        });
      }

      await this.avatarsRepository.create({
        avatarId,
        storageKey,
        originalName: file.originalname,
        sizeBytes: file.size,
        userId,
      });
    });
  }

  private async uploadFile(
    avatarId: string,
    userId: string,
    storageKey: string,
    file: Express.Multer.File,
  ): Promise<void> {
    try {
      await this.filesService.upload({
        key: storageKey,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: { avatarId, userId },
      });
    } catch {
      await this.changeStatus(
        avatarId,
        AVATAR_STATUSES.rejected,
        AVATAR_STATUSES.pending,
      );

      throw new ValidationError({ message: 'Не удалось загрузить файл' });
    }
  }

  private async markAsUploaded(avatarId: string): Promise<void> {
    await this.changeStatus(
      avatarId,
      AVATAR_STATUSES.uploaded,
      AVATAR_STATUSES.pending,
    );
  }

  private async changeStatus(
    avatarId: string,
    status: AvatarStatus,
    currentStatus: AvatarStatus,
  ): Promise<void> {
    const updated = await this.avatarsRepository.update(
      { avatarId, currentStatus },
      { status },
    );

    if (!updated) {
      throw new ValidationError({
        message: `Не удалось изменить статус аватара на "${status}"`,
        expose: false,
      });
    }
  }
}
