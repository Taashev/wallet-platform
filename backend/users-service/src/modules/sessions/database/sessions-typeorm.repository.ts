import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import { Session } from '../entities/session.entity';
import { SessionsRepository } from '../interfaces/sessions-repository.interface';
import type {
  CreateSession,
  SessionId,
  SessionRefreshTokenHash,
} from '../types/session.type';

import { SessionTypeOrmEntity } from './entities/session-typeorm.entity';

@Injectable()
@MapPostgresErrorToAppError()
export class SessionsTypeOrmRepository implements SessionsRepository {
  constructor(private transactionService: TransactionService) {}

  async create(sessionData: CreateSession): Promise<Session> {
    const repository =
      this.transactionService.manager.getRepository(SessionTypeOrmEntity);

    const session = Session.create(sessionData);

    const sessionTypeOrmEntity = repository.create({
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      refreshTokenHash: session.refreshTokenHash,
      userId: session.userId,
      userAgent: session.userAgent,
    });

    await repository.insert(sessionTypeOrmEntity);

    return session;
  }

  async rotateRefreshToken(
    sessionId: SessionId,
    currentRefreshTokenHash: SessionRefreshTokenHash,
    nextRefreshTokenHash: SessionRefreshTokenHash,
  ): Promise<boolean> {
    const repository =
      this.transactionService.manager.getRepository(SessionTypeOrmEntity);

    const updateQueryBuilder = repository
      .createQueryBuilder()
      .update(SessionTypeOrmEntity);

    updateQueryBuilder.set({ refreshTokenHash: nextRefreshTokenHash });

    updateQueryBuilder.where('session_id = :sessionId', { sessionId });

    updateQueryBuilder.andWhere(
      'refresh_token_hash = :currentRefreshTokenHash',
      { currentRefreshTokenHash },
    );

    updateQueryBuilder.andWhere('expires_at > NOW()');

    updateQueryBuilder.andWhere('revoked_at IS NULL');

    const result = await updateQueryBuilder.execute();

    return result.affected === 1 ? true : false;
  }

  async revokeBySessionId(sessionId: SessionId): Promise<boolean> {
    const repository =
      this.transactionService.manager.getRepository(SessionTypeOrmEntity);

    const updateQueryBuilder = repository
      .createQueryBuilder()
      .update(SessionTypeOrmEntity);

    updateQueryBuilder.set({ revokedAt: () => 'NOW()' });

    updateQueryBuilder.where('session_id = :sessionId', { sessionId });

    updateQueryBuilder.andWhere('expires_at > NOW()');

    updateQueryBuilder.andWhere('revoked_at IS NULL');

    const result = await updateQueryBuilder.execute();

    return result.affected === 1 ? true : false;
  }

  async findOneBySessionId(sessionId: SessionId): Promise<Session | null> {
    const repository =
      this.transactionService.manager.getRepository(SessionTypeOrmEntity);

    const sessionTypeOrmEntity = await repository.findOneBy({
      sessionId,
    });

    return sessionTypeOrmEntity ? Session.restore(sessionTypeOrmEntity) : null;
  }
}
