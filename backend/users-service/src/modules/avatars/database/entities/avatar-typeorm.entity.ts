import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserTypeOrmEntity } from '../../../users/database/entities/user-typeorm.entity';
import {
  CURRENT_DEFAULT_VALUE,
  MIME_TYPE_MAX_LENGTH,
  ORIGINAL_NAME_MAX_LENGTH,
  STATUS_DEFAULT_VALUE,
  STATUS_MAX_LENGTH,
} from '../../avatars.rules';
import type { AvatarStatus } from '../../types/avatar.type';
import {
  AVATARS_CONSTRAINT_AVATAR_ID_PK,
  AVATARS_CONSTRAINT_UNIQUE_CURRENT_USER,
  AVATARS_CONSTRAINT_USER_ID_FK,
  AVATARS_INDEX_ACTIVE_USER,
} from '../constants';

@Entity({ name: 'avatars' })
@Index(AVATARS_CONSTRAINT_UNIQUE_CURRENT_USER, ['userId'], {
  unique: true,
  where: `"current" = true AND "deleted_at" IS NULL`,
})
@Index(AVATARS_INDEX_ACTIVE_USER, ['userId'], {
  where: `"deleted_at" IS NULL`,
})
export class AvatarTypeOrmEntity {
  @PrimaryColumn({
    name: 'avatar_id',
    type: 'uuid',
    primaryKeyConstraintName: AVATARS_CONSTRAINT_AVATAR_ID_PK,
  })
  avatarId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @Column({ type: 'boolean', default: CURRENT_DEFAULT_VALUE })
  current!: boolean;

  @Column({
    type: 'varchar',
    default: STATUS_DEFAULT_VALUE,
    length: STATUS_MAX_LENGTH,
  })
  status!: AvatarStatus;

  @Column({ name: 'storage_key', type: 'varchar', nullable: false })
  storageKey!: string;

  @Column({
    name: 'original_name',
    type: 'varchar',
    length: ORIGINAL_NAME_MAX_LENGTH,
    nullable: false,
  })
  originalName!: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    nullable: true,
    length: MIME_TYPE_MAX_LENGTH,
  })
  mimeType!: string | null;

  @Column({ name: 'size_bytes', type: 'int', nullable: true })
  sizeBytes!: number | null;

  @ManyToOne(() => UserTypeOrmEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: AVATARS_CONSTRAINT_USER_ID_FK,
  })
  user!: UserTypeOrmEntity;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;
}
