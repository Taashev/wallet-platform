import { UserId } from '../../users/types/user.type';
import { SESSION_USER_AGENT_DEFAULT_VALUE } from '../sessions.rules';
import {
  CreateSession,
  RestoreSession,
  SessionExpiresAt,
  SessionId,
  SessionRefreshTokenHash,
  SessionRevokedAt,
  SessionUserAgent,
} from '../types/session.type';

type SessionProps = {
  sessionId: SessionId;
  expiresAt: SessionExpiresAt;
  revokedAt: SessionRevokedAt;
  refreshTokenHash: SessionRefreshTokenHash;
  userId: UserId;
  userAgent: SessionUserAgent;
};

export class Session {
  readonly sessionId: SessionId;
  readonly expiresAt: SessionExpiresAt;
  readonly revokedAt: SessionRevokedAt;
  readonly refreshTokenHash: SessionRefreshTokenHash;
  readonly userId: UserId;
  readonly userAgent: SessionUserAgent;

  private constructor(props: SessionProps) {
    this.sessionId = props.sessionId;
    this.revokedAt = props.revokedAt;
    this.expiresAt = props.expiresAt;
    this.refreshTokenHash = props.refreshTokenHash;
    this.userId = props.userId;
    this.userAgent = props.userAgent;
  }

  static create(createProps: CreateSession) {
    if (!createProps.sessionId.trim().length) {
      throw new Error('ID сессии не может быть пустой строкой');
    }

    if (!createProps.refreshTokenHash.trim().length) {
      throw new Error('refreshTokenHash не может быть пустой строкой');
    }

    if (!createProps.userId.trim().length) {
      throw new Error('userId не может быть пустой строкой');
    }

    return new Session({
      sessionId: createProps.sessionId,
      expiresAt: createProps.expiresAt,
      revokedAt: null,
      refreshTokenHash: createProps.refreshTokenHash,
      userId: createProps.userId,
      userAgent:
        createProps.userAgent && createProps.userAgent.trim().length
          ? createProps.userAgent
          : SESSION_USER_AGENT_DEFAULT_VALUE,
    });
  }

  static restore(restoreProps: RestoreSession) {
    return new Session(restoreProps);
  }
}
