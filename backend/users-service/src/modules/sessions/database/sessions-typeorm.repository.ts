import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { Session } from '../entities/session.entity';
import { SessionsRepository } from '../interfaces/sessions-repository.interface';
import { CreateSession } from '../types/session.type';

import { SessionTypeOrmEntity } from './entities/session-typeorm.entity';

@Injectable()
export class SessionsTypeOrmRepository implements SessionsRepository {
  constructor(private transactionService: TransactionService) {}

  async create(sessionData: CreateSession): Promise<Session> {
    const repo =
      this.transactionService.manager.getRepository(SessionTypeOrmEntity);

    const session = Session.create(sessionData);

    const sessionTypeOrmEntity = repo.create({
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      refreshTokenHash: session.refreshTokenHash,
      userId: session.userId,
      userAgent: session.userAgent,
    });

    await repo.insert(sessionTypeOrmEntity);

    return session;
  }
}
