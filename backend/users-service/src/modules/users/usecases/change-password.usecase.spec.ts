import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors';
import {
  createPasswordServiceMock,
  createSessionsServiceMock,
  createTransactionServiceMock,
  createUserMock,
  createUsersRepositoryMock,
  PasswordServiceMock,
  SessionsServiceMock,
  TransactionServiceMock,
  UsersRepositoryMock,
} from '../../../test/factory';
import { passwordMock, sessionIdMock, userIdMock } from '../../../test/mocks';
import { PasswordService } from '../../security/password.service';
import { SessionsService } from '../../sessions/sessions.service';
import { UsersRepository } from '../interfaces/repository.interface';

import { ChangePasswordUseCase } from './change-password.usecase';

describe('ChangePasswordUseCase', () => {
  let usersRepository: UsersRepositoryMock;
  let sessionsService: SessionsServiceMock;
  let passwordService: PasswordServiceMock;
  let transactionService: TransactionServiceMock;

  let changePasswordUseCase: ChangePasswordUseCase;

  beforeEach(() => {
    usersRepository = createUsersRepositoryMock();
    sessionsService = createSessionsServiceMock();
    passwordService = createPasswordServiceMock();
    transactionService = createTransactionServiceMock();

    changePasswordUseCase = new ChangePasswordUseCase(
      usersRepository as unknown as UsersRepository,
      passwordService as unknown as PasswordService,
      sessionsService as unknown as SessionsService,
      transactionService as unknown as TransactionService,
    );
  });

  it('успешно меняет пароль, отзывает текущую сессию и остальные сессии пользователя', async () => {
    const newPasswordMock = 'newPassword';
    const newHashPasswordMock = 'newHashPassword';
    const userMock = createUserMock();
    const currentPasswordHash = userMock.password;

    usersRepository.findOneByUserId.mockResolvedValue(userMock);
    passwordService.compare.mockResolvedValue(true);
    passwordService.hash.mockResolvedValue(newHashPasswordMock);
    sessionsService.revokeBySessionId.mockResolvedValue(true);
    usersRepository.updateUser.mockResolvedValue(true);
    sessionsService.revokeAllByUserId.mockResolvedValue(1);
    transactionService.run.mockImplementation(async (callback) => {
      return await callback();
    });

    await expect(
      changePasswordUseCase.execute(
        {
          sessionId: sessionIdMock,
          userId: userIdMock,
        },
        passwordMock,
        newPasswordMock,
      ),
    ).resolves.not.toThrow();

    expect(usersRepository.findOneByUserId).toHaveBeenCalledWith(userIdMock);

    expect(passwordService.compare).toHaveBeenCalledWith(
      passwordMock,
      currentPasswordHash,
    );

    expect(passwordService.hash).toHaveBeenCalledWith(newPasswordMock);

    expect(transactionService.run).toHaveBeenCalledTimes(1);

    expect(sessionsService.revokeBySessionId).toHaveBeenCalledWith(
      sessionIdMock,
    );

    expect(usersRepository.updateUser).toHaveBeenCalledWith(
      userIdMock,
      expect.objectContaining({ passwordHash: newHashPasswordMock }),
    );

    expect(sessionsService.revokeAllByUserId).toHaveBeenCalledWith(userIdMock);

    expect(userMock.password).toBe(newHashPasswordMock);
  });

  it('выбрасывает NotFoundError, если пользователь не найден', async () => {
    usersRepository.findOneByUserId.mockResolvedValue(null);

    await expect(
      changePasswordUseCase.execute(
        {
          sessionId: sessionIdMock,
          userId: userIdMock,
        },
        passwordMock,
        'newPassword',
      ),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(passwordService.compare).not.toHaveBeenCalled();
    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(transactionService.run).not.toHaveBeenCalled();
    expect(sessionsService.revokeBySessionId).not.toHaveBeenCalled();
    expect(usersRepository.updateUser).not.toHaveBeenCalled();
    expect(sessionsService.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('выбрасывает ValidationError, если старый пароль не прошел проверку', async () => {
    const userMock = createUserMock();
    const currentPasswordHash = userMock.password;

    usersRepository.findOneByUserId.mockResolvedValue(userMock);
    passwordService.compare.mockResolvedValue(false);

    await expect(
      changePasswordUseCase.execute(
        {
          sessionId: sessionIdMock,
          userId: userIdMock,
        },
        passwordMock,
        'newPassword',
      ),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(passwordService.compare).toHaveBeenCalledWith(
      passwordMock,
      currentPasswordHash,
    );
    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(transactionService.run).not.toHaveBeenCalled();
    expect(sessionsService.revokeBySessionId).not.toHaveBeenCalled();
    expect(usersRepository.updateUser).not.toHaveBeenCalled();
    expect(sessionsService.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('выбрасывает UnauthorizedError, если отзыв текущей сессии был отклонен', async () => {
    const newPasswordMock = 'newPassword';
    const newHashPasswordMock = 'newHashPassword';
    const userMock = createUserMock();

    usersRepository.findOneByUserId.mockResolvedValue(userMock);
    passwordService.compare.mockResolvedValue(true);
    passwordService.hash.mockResolvedValue(newHashPasswordMock);
    sessionsService.revokeBySessionId.mockResolvedValue(false);
    transactionService.run.mockImplementation(async (callback) => {
      return await callback();
    });

    await expect(
      changePasswordUseCase.execute(
        {
          sessionId: sessionIdMock,
          userId: userIdMock,
        },
        passwordMock,
        newPasswordMock,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedError);

    expect(transactionService.run).toHaveBeenCalledTimes(1);
    expect(sessionsService.revokeBySessionId).toHaveBeenCalledWith(
      sessionIdMock,
    );
    expect(usersRepository.updateUser).not.toHaveBeenCalled();
    expect(sessionsService.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('выбрасывает ValidationError, если репозиторий не обновил пароль пользователя', async () => {
    const newPasswordMock = 'newPassword';
    const newHashPasswordMock = 'newHashPassword';
    const userMock = createUserMock();

    usersRepository.findOneByUserId.mockResolvedValue(userMock);
    passwordService.compare.mockResolvedValue(true);
    passwordService.hash.mockResolvedValue(newHashPasswordMock);
    sessionsService.revokeBySessionId.mockResolvedValue(true);
    usersRepository.updateUser.mockResolvedValue(false);
    transactionService.run.mockImplementation(async (callback) => {
      return await callback();
    });

    await expect(
      changePasswordUseCase.execute(
        {
          sessionId: sessionIdMock,
          userId: userIdMock,
        },
        passwordMock,
        newPasswordMock,
      ),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(usersRepository.updateUser).toHaveBeenCalledWith(userIdMock, {
      passwordHash: newHashPasswordMock,
    });
    expect(sessionsService.revokeAllByUserId).not.toHaveBeenCalled();
  });
});
