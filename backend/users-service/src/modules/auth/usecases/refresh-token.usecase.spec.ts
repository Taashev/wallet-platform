import { UnauthorizedError } from '../../../shared/errors';
import {
  createSessionsServiceMock,
  createTokenServiceMock,
  SessionsServiceMock,
  TokenServiceMock,
} from '../../../test/factory';
import {
  authTokensMock,
  refreshTokenMock,
  sessionIdMock,
  userIdMock,
} from '../../../test/mocks';
import { TokenService } from '../../security/token.service';
import { SessionsService } from '../../sessions/sessions.service';

import { RefreshTokenUseCase } from './refresh-token.usecase';

describe('RefreshTokenUseCase', () => {
  let tokenService: TokenServiceMock;
  let sessionsService: SessionsServiceMock;

  let refreshTokenUseCase: RefreshTokenUseCase;

  beforeEach(() => {
    tokenService = createTokenServiceMock();
    sessionsService = createSessionsServiceMock();

    refreshTokenUseCase = new RefreshTokenUseCase(
      tokenService as unknown as TokenService,
      sessionsService as unknown as SessionsService,
    );
  });

  it('обновление токенов access + refresh прошло успешно', async () => {
    const newRefreshTokenMock = 'new-refresh-token';
    const newAccessTokenMock = 'new-access-token';

    tokenService.validateRefreshToken.mockReturnValue({
      sessionId: sessionIdMock,
      userId: userIdMock,
    });

    tokenService.createAuthTokens.mockReturnValue({
      accessToken: newAccessTokenMock,
      refreshToken: newRefreshTokenMock,
    });

    sessionsService.rotateRefreshToken.mockResolvedValue(true);

    const result = await refreshTokenUseCase.execute({
      refreshToken: refreshTokenMock,
    });

    expect(tokenService.validateRefreshToken).toHaveBeenCalledWith(
      refreshTokenMock,
    );

    expect(tokenService.createAuthTokens).toHaveBeenCalledWith({
      sessionId: sessionIdMock,
      userId: userIdMock,
    });

    expect(sessionsService.rotateRefreshToken).toHaveBeenCalledWith(
      sessionIdMock,
      refreshTokenMock,
      newRefreshTokenMock,
    );

    expect(result).toEqual({
      accessToken: newAccessTokenMock,
      refreshToken: newRefreshTokenMock,
    });
  });

  it('выбрасывает UnauthorizedError, если refresh токен не прошел валидацию', async () => {
    tokenService.validateRefreshToken.mockImplementation(() => {
      throw new Error('invalid token');
    });

    await expect(
      refreshTokenUseCase.execute({ refreshToken: refreshTokenMock }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(tokenService.createAuthTokens).not.toHaveBeenCalled();

    expect(sessionsService.rotateRefreshToken).not.toHaveBeenCalled();
  });

  it('выбрасывает UnauthorizedError, если хранилище отклонило ротацию refresh токена', async () => {
    tokenService.validateRefreshToken.mockReturnValue({
      sessionId: sessionIdMock,
      userId: userIdMock,
    });

    tokenService.createAuthTokens.mockReturnValue(authTokensMock);

    sessionsService.rotateRefreshToken.mockResolvedValue(false);

    await expect(
      refreshTokenUseCase.execute({ refreshToken: refreshTokenMock }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(tokenService.createAuthTokens).toHaveBeenCalledWith({
      sessionId: sessionIdMock,
      userId: userIdMock,
    });

    expect(sessionsService.rotateRefreshToken).toHaveBeenCalledWith(
      sessionIdMock,
      refreshTokenMock,
      refreshTokenMock,
    );
  });
});
