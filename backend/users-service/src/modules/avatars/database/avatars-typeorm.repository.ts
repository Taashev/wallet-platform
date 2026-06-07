import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import { ACTIVE_AVATAR_STATUSES } from '../constants/avatar-constants';
import { AvatarEntity } from '../entities/avatar.entity';
import { AvatarsRepository } from '../interfaces/avatars-repository.interface';
import {
  CreateAvatar,
  CriteriaUpdateAvatar,
  GetAvatarByIdOptions,
  UpdateAvatarData,
} from '../types/avatar.type';

import { AvatarTypeOrmEntity } from './entities/avatar-typeorm.entity';

@Injectable()
@MapPostgresErrorToAppError()
export class AvatarsTypeOrmRepository implements AvatarsRepository {
  constructor(private transactionService: TransactionService) {}

  async create(createAvatar: CreateAvatar): Promise<AvatarEntity> {
    const repository =
      this.transactionService.manager.getRepository(AvatarTypeOrmEntity);

    const avatar = AvatarEntity.create(createAvatar);

    const avatarTypeOrmEntity = repository.create({
      avatarId: avatar.avatarId,
      storageKey: avatar.storageKey,
      originalName: avatar.originalName,
      status: avatar.status,
      current: avatar.current,
      mimeType: avatar.mimeType,
      sizeBytes: avatar.sizeBytes,
      userId: avatar.userId,
    });

    await repository.insert(avatarTypeOrmEntity);

    return avatar;
  }

  async getCountAvatarsByUserId(userId: string): Promise<number> {
    const repository =
      this.transactionService.manager.getRepository(AvatarTypeOrmEntity);

    const queryBuilder = repository.createQueryBuilder('avatars');

    queryBuilder.where('avatars.user_id = :userId', { userId });

    queryBuilder.andWhere('avatars.status IN (:...statuses)', {
      statuses: ACTIVE_AVATAR_STATUSES,
    });

    queryBuilder.andWhere('avatars.deleted_at IS NULL');

    const result = await queryBuilder.getCount();

    return result;
  }

  async getByAvatarId(
    avatarId: string,
    options?: GetAvatarByIdOptions,
  ): Promise<AvatarEntity | null> {
    const repository =
      this.transactionService.manager.getRepository(AvatarTypeOrmEntity);

    const queryBuilder = repository.createQueryBuilder('avatars');

    queryBuilder.where('avatars.avatar_id = :avatarId', { avatarId });

    if (options?.userId) {
      queryBuilder.andWhere('avatars.user_id = :userId', {
        userId: options.userId,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('avatars.status = :status', {
        status: options.status,
      });
    }

    const avatarTypeOrmEntity = await queryBuilder.getOne();

    return avatarTypeOrmEntity
      ? AvatarEntity.restore(avatarTypeOrmEntity)
      : null;
  }

  async update(
    criteria: CriteriaUpdateAvatar,
    updatedData: UpdateAvatarData,
  ): Promise<boolean> {
    if (Object.keys(criteria).length === 0) {
      return false;
    }

    if (Object.keys(updatedData).length === 0) {
      return false;
    }

    const repository =
      this.transactionService.manager.getRepository(AvatarTypeOrmEntity);

    const dataToUpdate: Partial<AvatarTypeOrmEntity> = {};

    if (updatedData.mimeType !== undefined) {
      dataToUpdate.mimeType = updatedData.mimeType;
    }

    if (updatedData.sizeBytes !== undefined) {
      dataToUpdate.sizeBytes = updatedData.sizeBytes;
    }

    if (updatedData.storageKey !== undefined) {
      dataToUpdate.storageKey = updatedData.storageKey;
    }

    if (updatedData.status !== undefined) {
      dataToUpdate.status = updatedData.status;
    }

    if (updatedData.current !== undefined) {
      dataToUpdate.current = updatedData.current;
    }

    const queryBuilder = repository
      .createQueryBuilder('avatars')
      .update(AvatarTypeOrmEntity)
      .set(dataToUpdate);

    queryBuilder.where('avatars.deleted_at IS NULL');

    if (criteria.avatarId !== undefined) {
      queryBuilder.andWhere('avatars.avatar_id = :avatarId', {
        avatarId: criteria.avatarId,
      });
    }

    if (criteria.userId !== undefined) {
      queryBuilder.andWhere('avatars.user_id = :userId', {
        userId: criteria.userId,
      });
    }

    if (criteria?.currentStatus !== undefined) {
      queryBuilder.andWhere('avatars.status = :currentStatus', {
        currentStatus: criteria.currentStatus,
      });
    }

    if (criteria?.current !== undefined) {
      queryBuilder.andWhere('avatars.current = :current', {
        current: criteria.current,
      });
    }

    const result = await queryBuilder.execute();

    return result.affected === 1;
  }
}
