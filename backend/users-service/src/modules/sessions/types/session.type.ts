// Alias
export type SessionId = string;
export type SessionRevokedAt = Date | null;
export type SessionExpiresAt = Date;
export type SessionRefreshTokenHash = string;
export type SessionUserAgent = string;

export type CreateSession = {
  sessionId: SessionId;
  expiresAt: SessionExpiresAt;
  refreshTokenHash: SessionRefreshTokenHash;
  userId: string;
  userAgent: SessionUserAgent | undefined;
};

export type RestoreSession = Omit<Required<CreateSession>, 'userAgent'> & {
  revokedAt: SessionRevokedAt;
  userAgent: SessionUserAgent;
};
