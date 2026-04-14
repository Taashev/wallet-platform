import { Session } from '../entities/session.entity';
import {
  CreateSession,
  SessionId,
  SessionRefreshTokenHash,
} from '../types/session.type';

export interface SessionsRepository {
  create(sessionData: CreateSession): Promise<Session>;

  rotateRefreshToken(
    sessionId: SessionId,
    currentRefreshTokenHash: SessionRefreshTokenHash,
    nextRefreshTokenHash: SessionRefreshTokenHash,
  ): Promise<boolean>;

  revokeBySessionId(sessionId: SessionId): Promise<boolean>;

  revokeAllByUserId(userId: string): Promise<number>;

  findOneBySessionId(sessionId: SessionId): Promise<Session | null>;
}
