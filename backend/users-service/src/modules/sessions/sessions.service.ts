import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createHash } from 'node:crypto';

import { AuthConfigType, ConfigType } from '../../infrastructure/config';
import { ERROR_MESSAGES } from '../../shared/constants/messages.error';
import { NotFoundError } from '../../shared/errors';

import type { SessionsRepository } from './interfaces/sessions-repository.interface';
import { SESSION_REPOSITORY } from './sessions.keys';
import {
  SessionId,
  SessionRefreshTokenHash,
  SessionUserAgent,
} from './types/session.type';

@Injectable()
export class SessionsService {
  constructor(
    private config: ConfigService<ConfigType>,
    @Inject(SESSION_REPOSITORY)
    private sessionsRepository: SessionsRepository,
  ) {}

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private createExpirationDate(ttlMs: number) {
    return new Date(Date.now() + ttlMs);
  }

  generateSessionId() {
    return crypto.randomUUID();
  }

  async create(sessionData: {
    sessionId: SessionId;
    refreshToken: SessionRefreshTokenHash;
    userId: string;
    userAgent: SessionUserAgent | undefined;
  }) {
    const authConfig = this.config.getOrThrow<AuthConfigType>('auth');

    const sessionTtlMs = authConfig.session.ttlSeconds * 1000;

    const expiresAt = this.createExpirationDate(sessionTtlMs);

    const refreshTokenHash = this.hash(sessionData.refreshToken);

    const session = await this.sessionsRepository.create({
      sessionId: sessionData.sessionId,
      expiresAt,
      refreshTokenHash,
      userId: sessionData.userId,
      userAgent: sessionData.userAgent,
    });

    return session;
  }

  async getOneBySessionIdOrFail(sessionId: SessionId) {
    const session = await this.sessionsRepository.findOneBySessionId(sessionId);

    if (!session) {
      throw new NotFoundError({
        message: 'Сессия не найдена по sessionId',
        safeMessage: ERROR_MESSAGES.SESSION_NOT_FOUND,
        expose: true,
      });
    }

    return session;
  }

  async rotateRefreshToken(
    sessionId: SessionId,
    currentRefreshToken: SessionRefreshTokenHash,
    nextRefreshToken: SessionRefreshTokenHash,
  ) {
    const currentRefreshTokenHash = this.hash(currentRefreshToken);
    const nextRefreshTokenHash = this.hash(nextRefreshToken);

    return await this.sessionsRepository.rotateRefreshToken(
      sessionId,
      currentRefreshTokenHash,
      nextRefreshTokenHash,
    );
  }

  async revokeBySessionId(sessionId: SessionId) {
    return await this.sessionsRepository.revokeBySessionId(sessionId);
  }

  async revokeAllByUserId(userId: string) {
    return await this.sessionsRepository.revokeAllByUserId(userId);
  }
}
