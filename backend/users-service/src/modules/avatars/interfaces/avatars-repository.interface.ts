import { AvatarEntity } from '../entities/avatar.entity';
import {
  AvatarStatus,
  CreateAvatar,
  CriteriaUpdateAvatar,
  UpdateAvatarData,
} from '../types/avatar.type';

export interface AvatarsRepository {
  create(createAvatar: CreateAvatar): Promise<AvatarEntity>;

  getCountAvatarsByUserId(userId: string): Promise<number>;

  getByAvatarId(
    avatarId: string,
    options?: { status?: AvatarStatus; userId?: string },
  ): Promise<AvatarEntity | null>;

  findCurrentByUserIds(userIds: string[]): Promise<AvatarEntity[]>;

  update(
    criteria: CriteriaUpdateAvatar,
    updatedData: UpdateAvatarData,
  ): Promise<boolean>;

  softDelete(avatarId: string, userId: string): Promise<boolean>;
}
