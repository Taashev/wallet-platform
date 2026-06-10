import { Inject, Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { NotFoundError } from '../../../shared/errors';
import { USERS_REPOSITORY } from '../constants/users.keys';
import type { UsersRepository } from '../interfaces/users-repository.interface';
import { UserId } from '../types/user.type';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
  ) {}

  async execute(userId: UserId) {
    const user = await this.usersRepository.findOneByUserId(userId);

    if (!user) {
      throw new NotFoundError({
        message:
          'Access token успешно провалидирован, но пользователь не найден',
        safeMessage: ERROR_MESSAGES.USER_NOT_FOUND,
        expose: true,
      });
    }

    return user;
  }
}
