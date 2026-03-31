export type AccessTokenPayload = {
  userId: string;
  sessionId: string;
};

export type RefreshTokenPayload = {
  sessionId: string;
};
