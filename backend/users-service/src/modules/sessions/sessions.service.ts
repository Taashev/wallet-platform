import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createHash } from 'node:crypto';

import { AuthConfigType, ConfigType } from '../../infrastructure/config';

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

  hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  generateSessionId() {
    return crypto.randomUUID();
  }

  createExpirationDate(timeInSeconds: number) {
    return new Date(Date.now() + timeInSeconds * 1000 * 60 * 60);
  }

  async create(sessionData: {
    sessionId: SessionId;
    refreshToken: SessionRefreshTokenHash;
    userId: string;
    userAgent: SessionUserAgent | undefined;
  }) {
    const authConfig = this.config.getOrThrow<AuthConfigType>('auth');

    const expiresAt = this.createExpirationDate(authConfig.SESSION_EXPIRES_IN);

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

  update() {}

  revoke() {}

  validate() {}
}
