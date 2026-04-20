export type AuthSession = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSessionStorageKind = 'session_storage' | 'memory';

export type AuthSessionBootstrapStatus =
  | 'bootstrapping'
  | 'authenticated'
  | 'unauthenticated';

export type AuthSessionSnapshot = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapped: boolean;
  bootstrapStatus: AuthSessionBootstrapStatus;
  storageKind: AuthSessionStorageKind;
};
