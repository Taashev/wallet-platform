import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { UserTypeOrmEntity } from '../../../users/database/entities/user-typeorm.entity';
import type {
  SessionExpiresAt,
  SessionId,
  SessionRefreshTokenHash,
  SessionRevokedAt,
  SessionUserAgent,
} from '../../types/session.type';
import {
  SESSIONS_CONSTRAINT_SESSION_ID_PK,
  SESSIONS_CONSTRAINT_USER_ID_FK,
} from '../constants';

@Entity({ name: 'sessions' })
export class SessionTypeOrmEntity {
  @PrimaryColumn({
    name: 'session_id',
    type: 'uuid',
    primaryKeyConstraintName: SESSIONS_CONSTRAINT_SESSION_ID_PK,
  })
  sessionId!: SessionId;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: false })
  expiresAt!: SessionExpiresAt;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: SessionRevokedAt;

  @Column({ name: 'refresh_token_hash', type: 'text', nullable: false })
  refreshTokenHash!: SessionRefreshTokenHash;

  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId!: string;

  @Column({ name: 'user_agent', type: 'text', nullable: false })
  userAgent!: SessionUserAgent;

  @ManyToOne(() => UserTypeOrmEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: SESSIONS_CONSTRAINT_USER_ID_FK,
  })
  user?: UserTypeOrmEntity;
}
