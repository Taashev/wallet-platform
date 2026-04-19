import { Session } from '../../modules/sessions/entities/session.entity';
import { SessionsRepository } from '../../modules/sessions/interfaces/sessions-repository.interface';
import { SessionsService } from '../../modules/sessions/sessions.service';
import {
  expiresAtMock,
  refreshTokenHashMock,
  sessionIdMock,
  userAgentMock,
  userIdMock,
} from '../mocks';

export type SessionsRepositoryMock = jest.Mocked<
  Pick<
    SessionsRepository,
    | 'create'
    | 'findOneBySessionId'
    | 'revokeAllByUserId'
    | 'revokeBySessionId'
    | 'rotateRefreshToken'
  >
>;

export type SessionsServiceMock = jest.Mocked<
  Pick<
    SessionsService,
    | 'generateSessionId'
    | 'create'
    | 'getOneBySessionIdOrFail'
    | 'rotateRefreshToken'
    | 'revokeAllByUserId'
    | 'revokeBySessionId'
  >
>;

export const createSessionsRepositoryMock = (): SessionsRepositoryMock => ({
  create: jest.fn(),
  findOneBySessionId: jest.fn(),
  revokeAllByUserId: jest.fn(),
  revokeBySessionId: jest.fn(),
  rotateRefreshToken: jest.fn(),
});

export const createSessionsServiceMock = (): SessionsServiceMock => ({
  generateSessionId: jest.fn(),
  create: jest.fn(),
  getOneBySessionIdOrFail: jest.fn(),
  rotateRefreshToken: jest.fn(),
  revokeAllByUserId: jest.fn(),
  revokeBySessionId: jest.fn(),
});

export const createSessionMock = (
  props: {
    sessionId?: string;
    expiresAt?: Date;
    refreshTokenHash?: string;
    userAgent?: string;
    userId?: string;
  } = {},
) =>
  Session.create({
    sessionId: props?.sessionId ?? sessionIdMock,
    expiresAt: props?.expiresAt ?? new Date(expiresAtMock),
    refreshTokenHash: props?.refreshTokenHash ?? refreshTokenHashMock,
    userAgent: props?.userAgent ?? userAgentMock,
    userId: props?.userId ?? userIdMock,
  });
