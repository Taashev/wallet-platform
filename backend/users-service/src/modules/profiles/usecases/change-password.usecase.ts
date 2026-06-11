import { Inject, Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors';
import { PasswordService } from '../../security/password.service';
import { SessionsService } from '../../sessions/sessions.service';
import { USERS_REPOSITORY } from '../../users/constants/users.keys';
import type { UsersRepository } from '../../users/interfaces/users-repository.interface';
import { CurrentUserType, Password } from '../../users/types/user.type';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    private passwordService: PasswordService,
    private sessionsService: SessionsService,
    private transactionService: TransactionService,
  ) {}

  async execute(
    currentUser: CurrentUserType,
    oldPassword: Password,
    newPassword: Password,
  ) {
    const user = await this.usersRepository.findOneByUserId(currentUser.userId);

    if (!user) {
      throw new NotFoundError({
        message: `Неудалось обновить пользователя: пользователь ${currentUser.userId} не найден`,
        safeMessage: ERROR_MESSAGES.USER_NOT_FOUND,
        expose: true,
      });
    }

    const isValidPassword = await this.passwordService.compare(
      oldPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new ValidationError({
        message: 'Невалидный подтверждение старого пароля',
        safeMessage: ERROR_MESSAGES.INVALID_CREDENTIALS,
        expose: true,
      });
    }

    const newPasswordHash = await this.passwordService.hash(newPassword);

    user.changePassword(newPasswordHash);

    await this.transactionService.run(async () => {
      const isRevoked = await this.sessionsService.revokeBySessionId(
        currentUser.sessionId,
      );

      if (!isRevoked) {
        throw new UnauthorizedError({
          message: 'Отзыв сессии был отклонен хранилищем сессий',
          safeMessage: ERROR_MESSAGES.INVALID_ACCESS_TOKEN,
          expose: true,
        });
      }

      const isUpdated = await this.usersRepository.updateUser(user.userId, {
        passwordHash: newPasswordHash,
      });

      if (!isUpdated) {
        throw new ValidationError({
          message: ERROR_MESSAGES.INVALID_UPDATE_DATA,
          expose: true,
        });
      }

      await this.sessionsService.revokeAllByUserId(currentUser.userId);
    });
  }
}
