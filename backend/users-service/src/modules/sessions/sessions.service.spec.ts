import { ConfigService } from '@nestjs/config';

import { createHash } from 'node:crypto';

import { ConfigType } from '../../infrastructure/config';
import { NotFoundError } from '../../shared/errors';
import {
  ConfigServiceMock,
  createConfigServiceMock,
  createSessionMock,
  createSessionsRepositoryMock,
  SessionsRepositoryMock,
} from '../../test/factory';
import {
  refreshTokenHashMock,
  refreshTokenMock,
  sessionIdMock,
  userAgentMock,
  userIdMock,
} from '../../test/mocks';

import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let configService: ConfigServiceMock;
  let sessionsRepository: SessionsRepositoryMock;

  let sessionsService: SessionsService;

  beforeEach(() => {
    configService = createConfigServiceMock();
    sessionsRepository = createSessionsRepositoryMock();

    sessionsService = new SessionsService(
      configService as unknown as ConfigService<ConfigType>,
      sessionsRepository,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('создает сессию с hashed refresh token и expiresAt на основе ttl', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-18T12:00:00.000Z'));

    const sessionMock = createSessionMock();

    sessionsRepository.create.mockResolvedValue(sessionMock);

    const result = await sessionsService.create({
      sessionId: sessionIdMock,
      refreshToken: refreshTokenMock,
      userId: userIdMock,
      userAgent: userAgentMock,
    });

    expect(configService.getOrThrow).toHaveBeenCalledWith('auth');

    expect(sessionsRepository.create).toHaveBeenCalledWith({
      sessionId: sessionIdMock,
      expiresAt: new Date('2026-04-18T14:00:00.000Z'),
      refreshTokenHash: refreshTokenHashMock,
      userId: userIdMock,
      userAgent: userAgentMock,
    });

    expect(result).toBe(sessionMock);
  });

  it('выбрасывает NotFoundError, если сессия не найдена по sessionId', async () => {
    sessionsRepository.findOneBySessionId.mockResolvedValue(null);

    await expect(
      sessionsService.getOneBySessionIdOrFail(sessionIdMock),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('возвращает сессию по sessionId, если она найдена', async () => {
    const sessionMock = createSessionMock();

    sessionsRepository.findOneBySessionId.mockResolvedValue(sessionMock);

    const result = await sessionsService.getOneBySessionIdOrFail(sessionIdMock);

    expect(sessionsRepository.findOneBySessionId).toHaveBeenCalledWith(
      sessionIdMock,
    );
    expect(result).toBe(sessionMock);
  });

  it('хеширует текущий и следующий refresh token перед ротацией', async () => {
    const nextRefreshTokenMock = 'next-refresh-token';

    sessionsRepository.rotateRefreshToken.mockResolvedValue(true);

    const result = await sessionsService.rotateRefreshToken(
      sessionIdMock,
      refreshTokenMock,
      nextRefreshTokenMock,
    );

    expect(sessionsRepository.rotateRefreshToken).toHaveBeenCalledWith(
      sessionIdMock,
      createHash('sha256').update(refreshTokenMock).digest('hex'),
      createHash('sha256').update(nextRefreshTokenMock).digest('hex'),
    );
    expect(result).toBe(true);
  });
});
