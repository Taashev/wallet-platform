import { TokenService } from '../../modules/security/token.service';

export type TokenServiceMock = jest.Mocked<
  Pick<
    TokenService,
    'createAuthTokens' | 'validateAccessToken' | 'validateRefreshToken'
  >
>;

export const createTokenServiceMock = (): TokenServiceMock => ({
  createAuthTokens: jest.fn(),
  validateAccessToken: jest.fn(),
  validateRefreshToken: jest.fn(),
});
