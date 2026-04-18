import { Session } from '../../modules/sessions/entities/session.entity';
import { SessionsService } from '../../modules/sessions/sessions.service';
import {
  expiresAtMock,
  refreshTokenHashMock,
  sessionIdMock,
  userAgentMock,
  userIdMock,
} from '../mocks';

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
