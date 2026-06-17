import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import {
  createPasswordServiceMock,
  createSessionMock,
  createSessionsServiceMock,
  createTokenServiceMock,
  createTransactionServiceMock,
  createUserMock,
  createUsersRepositoryMock,
  createWalletMock,
  createWalletRepositoryMock,
  PasswordServiceMock,
  SessionsServiceMock,
  TokenServiceMock,
  TransactionServiceMock,
  UsersRepositoryMock,
  WalletRepositoryMock,
} from '../../../test/factory';
import {
  aboutMock,
  authTokensMock,
  dateOfBirthMock,
  emailMock,
  passwordHashMock,
  passwordMock,
  sessionIdMock,
  userAgentMock,
  userIdMock,
  usernameMock,
} from '../../../test/mocks';
import { PasswordService } from '../../security/password.service';
import { TokenService } from '../../security/token.service';
import { SessionsService } from '../../sessions/sessions.service';
import { WalletRepository } from '../../wallet/interfaces/wallet-repository.intreface';

import { SignupUseCase } from './signup.usecase';

describe('SignUpUseCase', () => {
  let usersRepository: UsersRepositoryMock;
  let sessionsService: SessionsServiceMock;
  let tokenService: TokenServiceMock;
  let passwordService: PasswordServiceMock;
  let transactionServie: TransactionServiceMock;
  let walletRepository: WalletRepositoryMock;

  let signUpUseCase: SignupUseCase;

  beforeEach(() => {
    usersRepository = createUsersRepositoryMock();
    sessionsService = createSessionsServiceMock();
    tokenService = createTokenServiceMock();
    passwordService = createPasswordServiceMock();
    transactionServie = createTransactionServiceMock();
    walletRepository = createWalletRepositoryMock();

    signUpUseCase = new SignupUseCase(
      usersRepository,
      walletRepository as unknown as WalletRepository,
      sessionsService as unknown as SessionsService,
      tokenService as unknown as TokenService,
      passwordService as unknown as PasswordService,
      transactionServie as unknown as TransactionService,
    );
  });

  it('создает пользователя, кошелек, сессию и возвращает auth tokens', async () => {
    const userMock = createUserMock();
    const sessionMock = createSessionMock();
    const walletMock = createWalletMock();

    passwordService.hash.mockResolvedValue(passwordHashMock);

    jest.spyOn(crypto, 'randomUUID').mockReturnValue(userIdMock);

    sessionsService.generateSessionId.mockReturnValue(sessionIdMock);

    walletRepository.create.mockResolvedValue(walletMock);

    tokenService.createAuthTokens.mockReturnValue(authTokensMock);

    usersRepository.create.mockResolvedValue(userMock);

    transactionServie.run.mockImplementation(async (callback) => {
      return await callback();
    });

    sessionsService.create.mockResolvedValue(sessionMock);

    const result = await signUpUseCase.execute(
      {
        username: usernameMock,
        email: emailMock,
        password: passwordMock,
        dateOfBirth: dateOfBirthMock,
        about: aboutMock,
      },
      userAgentMock,
    );

    expect(passwordService.hash).toHaveBeenCalledWith(passwordMock);

    expect(walletRepository.create).toHaveBeenCalledWith(userIdMock);

    expect(sessionsService.generateSessionId).toHaveBeenCalledTimes(1);

    expect(tokenService.createAuthTokens).toHaveBeenCalledWith({
      userId: userIdMock,
      sessionId: sessionIdMock,
    });

    expect(transactionServie.run).toHaveBeenCalledTimes(1);

    expect(usersRepository.create).toHaveBeenCalledWith({
      userId: userIdMock,
      username: usernameMock,
      email: emailMock,
      password: passwordHashMock,
      about: aboutMock,
      dateOfBirth: dateOfBirthMock,
    });

    expect(result).toEqual(authTokensMock);
  });
});
