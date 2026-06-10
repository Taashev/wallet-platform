import { Inject, Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { NotFoundError, ValidationError } from '../../../shared/errors';
import { USERS_REPOSITORY } from '../constants/users.keys';
import type { UsersRepository } from '../interfaces/users-repository.interface';
import { UpdateUser, UserId } from '../types/user.type';

@Injectable()
export class UpdateCurrentUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
  ) {}

  async execute(userId: UserId, updateUserDto: UpdateUser) {
    const fields = Object.entries(updateUserDto).filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => value !== undefined,
    );

    if (!fields.length) {
      throw new ValidationError({
        message: 'Пустое тело запроса',
        safeMessage: ERROR_MESSAGES.VALIDATION_ERROR,
        expose: true,
      });
    }

    const user = await this.usersRepository.findOneByUserId(userId);

    if (!user) {
      throw new NotFoundError({
        message: `Неудалось обновить пользователя: пользователь ${userId} не найден`,
        safeMessage: ERROR_MESSAGES.USER_NOT_FOUND,
        expose: true,
      });
    }

    const changeFileds = Object.fromEntries(fields);

    user.changeProfile(changeFileds);

    const isUpdated = await this.usersRepository.updateUser(
      user.userId,
      changeFileds,
    );

    if (!isUpdated) {
      throw new ValidationError({
        message: ERROR_MESSAGES.INVALID_UPDATE_DATA,
        expose: true,
      });
    }

    return user;
  }
}
