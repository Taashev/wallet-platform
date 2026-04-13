import { Inject, Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { UnauthorizedError, ValidationError } from '../../../shared/errors';
import type { UsersRepository } from '../interfaces/repository.interface';
import { UserId } from '../types/user.type';
import { USERS_REPOSITORY } from '../users.keys';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
  ) {}

  async execute(userId: UserId) {
    if (!userId) {
      throw new ValidationError({
        message: `Параметр userId не передан: ${userId}`,
        safeMessage: ERROR_MESSAGES.VALIDATION_ERROR,
        expose: true,
      });
    }

    const user = await this.usersRepository.findOneByUserId(userId);

    if (!user) {
      throw new UnauthorizedError({
        message:
          'Access token успешно провалидирован, но пользователь не найден',
        safeMessage: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
        expose: true,
      });
    }

    return user;
  }
}
