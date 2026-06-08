import { Inject, Injectable } from '@nestjs/common';

import type { IFileStorageService } from '../../../infrastructure/file-storage/file-storage.interface';
import { FILE_STORAGE_SERVICE } from '../../../infrastructure/file-storage/file-storage.keys';
import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { NotFoundError, ValidationError } from '../../../shared/errors';
import { AVATARS_REPOSITORY } from '../constants/avatar.keys';
import type { AvatarsRepository } from '../interfaces/avatars-repository.interface';

@Injectable()
export class DeleteAvatarUseCase {
  constructor(
    private transactionService: TransactionService,
    @Inject(FILE_STORAGE_SERVICE) private fileService: IFileStorageService,
    @Inject(AVATARS_REPOSITORY) private avatarsRepository: AvatarsRepository,
  ) {}

  async execute(avatarId: string, userId: string) {
    const avatar = await this.avatarsRepository.getByAvatarId(avatarId, {
      userId,
    });

    if (avatar === null) {
      throw new NotFoundError({
        message: `Не удалось найти аватар по id ${avatarId}`,
        expose: true,
      });
    }

    await this.transactionService.run(async () => {
      await this.avatarsRepository.update(
        { avatarId, userId },
        { current: false },
      );

      const isDeleted = await this.avatarsRepository.softDelete(
        avatarId,
        userId,
      );

      if (!isDeleted) {
        throw new ValidationError({
          message: 'Не удалось удалить аватар',
          expose: true,
        });
      }
    });

    await this.fileService.delete(avatar.storageKey);
  }
}
