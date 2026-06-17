import { NotFoundError, ValidationError } from '../../../shared/errors';
import {
  createUserMock,
  createUsersRepositoryMock,
  UsersRepositoryMock,
} from '../../../test/factory';
import { emailMock, userIdMock, usernameMock } from '../../../test/mocks';
import { ProfileCacheService } from '../profile-cache.service';

import { UpdateCurrentUserUseCase } from './update-current-user.usecase';

describe('UpdateCurrentUserUseCase', () => {
  let usersRepository: UsersRepositoryMock;
  let profileCacheService: jest.Mocked<
    Pick<ProfileCacheService, 'invalidateUser'>
  >;

  let updateCurrentUserUseCase: UpdateCurrentUserUseCase;

  beforeEach(() => {
    usersRepository = createUsersRepositoryMock();
    profileCacheService = {
      invalidateUser: jest.fn(),
    };

    updateCurrentUserUseCase = new UpdateCurrentUserUseCase(
      usersRepository,
      profileCacheService as unknown as ProfileCacheService,
    );
  });

  it('успешно обновляет профиль пользователя', async () => {
    const userMock = createUserMock();
    const newUsername = 'new-username';

    usersRepository.findOneByUserId.mockResolvedValue(userMock);

    usersRepository.updateUser.mockResolvedValue(true);

    const result = await updateCurrentUserUseCase.execute(userIdMock, {
      username: newUsername,
      email: undefined,
    });

    expect(usersRepository.findOneByUserId).toHaveBeenCalledWith(userIdMock);

    expect(usersRepository.updateUser).toHaveBeenCalledWith(userIdMock, {
      username: newUsername,
    });

    expect(profileCacheService.invalidateUser).toHaveBeenCalledWith(userIdMock);

    expect(result).toBe(userMock);

    expect(result.username).toBe(newUsername);

    expect(result.email).toBe(emailMock);
  });

  it('выбрасывает ValidationError, если тело запроса пустое', async () => {
    await expect(
      updateCurrentUserUseCase.execute(userIdMock, {}),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(usersRepository.findOneByUserId).not.toHaveBeenCalled();

    expect(usersRepository.updateUser).not.toHaveBeenCalled();

    expect(profileCacheService.invalidateUser).not.toHaveBeenCalled();
  });

  it('выбрасывает NotFoundError, если пользователь не найден', async () => {
    usersRepository.findOneByUserId.mockResolvedValue(null);

    await expect(
      updateCurrentUserUseCase.execute(userIdMock, {
        username: usernameMock,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(usersRepository.updateUser).not.toHaveBeenCalled();

    expect(profileCacheService.invalidateUser).not.toHaveBeenCalled();
  });

  it('выбрасывает ValidationError, если репозиторий не обновил пользователя', async () => {
    const userMock = createUserMock();

    usersRepository.findOneByUserId.mockResolvedValue(userMock);

    usersRepository.updateUser.mockResolvedValue(false);

    await expect(
      updateCurrentUserUseCase.execute(userIdMock, {
        email: emailMock,
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(usersRepository.updateUser).toHaveBeenCalledWith(userIdMock, {
      email: emailMock,
    });

    expect(profileCacheService.invalidateUser).not.toHaveBeenCalled();
  });
});
