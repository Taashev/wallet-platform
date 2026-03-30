import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { Session } from '../entities/session.entity';
import { SessionsRepository } from '../interfaces/sessions-repository.interface';
import { CreateSession } from '../types/session.type';

import { SessionTypeOrmEntity } from './entities/session-typeorm.entity';

@Injectable()
export class SessionsTypeOrmRepository implements SessionsRepository {
  constructor(
    @InjectRepository(SessionTypeOrmEntity)
    private sessionsRepository: Repository<SessionTypeOrmEntity>,
  ) {}

  async create(
    sessionData: CreateSession,
    manager?: EntityManager,
  ): Promise<Session> {
    const repository = manager
      ? manager.getRepository(SessionTypeOrmEntity)
      : this.sessionsRepository;

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
}
