export type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSessionStorageKind = 'session_storage' | 'memory';

export type AuthSessionSnapshot = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  storageKind: AuthSessionStorageKind;
};
