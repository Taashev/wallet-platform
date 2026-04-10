export type AccessTokenPayload = {
  userId: string;
};

export type RefreshTokenPayload = {
  sessionId: string;
  userId: string;
};
