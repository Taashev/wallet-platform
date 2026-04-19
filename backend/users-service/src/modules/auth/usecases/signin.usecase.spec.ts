import { UnauthorizedError } from '../../../shared/errors';
import {
  createPasswordServiceMock,
  createSessionMock,
  createSessionsServiceMock,
  createTokenServiceMock,
  createUserMock,
  createUsersRepositoryMock,
  PasswordServiceMock,
  SessionsServiceMock,
  TokenServiceMock,
  UsersRepositoryMock,
} from '../../../test/factory';
import {
  authTokensMock,
  passwordMock,
  sessionIdMock,
  userAgentMock,
  usernameMock,
} from '../../../test/mocks';
import { PasswordService } from '../../security/password.service';
import { TokenService } from '../../security/token.service';
import { SessionsService } from '../../sessions/sessions.service';
import { UsersRepository } from '../../users/interfaces/repository.interface';

import { SigninUseCase } from './signin.usecase';

describe('SigninUseCase', () => {
  let usersRepository: UsersRepositoryMock;
  let sessionsService: SessionsServiceMock;
  let tokenService: TokenServiceMock;
  let passwordService: PasswordServiceMock;

  let signinUseCase: SigninUseCase;

  beforeEach(() => {
    usersRepository = createUsersRepositoryMock();
    sessionsService = createSessionsServiceMock();
    tokenService = createTokenServiceMock();
    passwordService = createPasswordServiceMock();

    signinUseCase = new SigninUseCase(
      usersRepository as unknown as UsersRepository,
      passwordService as unknown as PasswordService,
      tokenService as unknown as TokenService,
      sessionsService as unknown as SessionsService,
    );
  });

  it('возвращает auth токены и сохранить сессию при валидных username и password', async () => {
    const userMock = createUserMock();
    const sessionMock = createSessionMock();

    usersRepository.findOneByUsername.mockResolvedValue(userMock);

    passwordService.compare.mockResolvedValue(true);

    sessionsService.generateSessionId.mockReturnValue(sessionIdMock);

    tokenService.createAuthTokens.mockReturnValue(authTokensMock);

    sessionsService.create.mockResolvedValue(sessionMock);

    const result = await signinUseCase.execute(
      { username: usernameMock, password: passwordMock },
      userAgentMock,
    );

    expect(usersRepository.findOneByUsername).toHaveBeenCalledWith(
      usernameMock,
    );

    expect(sessionsService.generateSessionId).toHaveBeenCalledTimes(1);

    expect(passwordService.compare).toHaveBeenCalledWith(
      passwordMock,
      userMock.password,
    );

    expect(tokenService.createAuthTokens).toHaveBeenCalledWith({
      userId: userMock.userId,
      sessionId: sessionIdMock,
    });

    expect(sessionsService.create).toHaveBeenCalledWith({
      sessionId: sessionIdMock,
      refreshToken: authTokensMock.refreshToken,
      userId: userMock.userId,
      userAgent: userAgentMock,
    });

    expect(result).toEqual(authTokensMock);
  });

  it('выбрасывает ошибку UnauthorizedError, если пользователь не найден', async () => {
    usersRepository.findOneByUsername.mockResolvedValue(null);

    await expect(
      signinUseCase.execute({ username: usernameMock, password: passwordMock }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(passwordService.compare).not.toHaveBeenCalled();
    expect(sessionsService.generateSessionId).not.toHaveBeenCalled();
    expect(tokenService.createAuthTokens).not.toHaveBeenCalled();
    expect(sessionsService.create).not.toHaveBeenCalled();
  });

  it('выбрасывает ошибку UnauthorizedError, если пароль неверный', async () => {
    const userMock = createUserMock();

    usersRepository.findOneByUsername.mockResolvedValue(userMock);

    passwordService.compare.mockResolvedValue(false);

    await expect(
      signinUseCase.execute({ username: usernameMock, password: passwordMock }),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(sessionsService.generateSessionId).not.toHaveBeenCalled();
    expect(tokenService.createAuthTokens).not.toHaveBeenCalled();
    expect(sessionsService.create).not.toHaveBeenCalled();
  });
});
