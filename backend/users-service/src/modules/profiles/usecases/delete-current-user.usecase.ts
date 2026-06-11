import { Inject } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { UnauthorizedError } from '../../../shared/errors';
import { SessionsService } from '../../sessions/sessions.service';
import { USERS_REPOSITORY } from '../../users/constants/users.keys';
import type { UsersRepository } from '../../users/interfaces/users-repository.interface';
import { CurrentUserType } from '../../users/types/user.type';
import { ProfileCacheService } from '../profile-cache.service';

export class DeleteCurrentUserUseCase {
  constructor(
    private transactionService: TransactionService,
    private sessionsService: SessionsService,
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    private profileCacheService: ProfileCacheService,
  ) {}

  async execute(currentUser: CurrentUserType) {
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

      await this.usersRepository.softDelete(currentUser.userId);

      await this.sessionsService.revokeAllByUserId(currentUser.userId);
    });

    await this.profileCacheService.invalidateUser(currentUser.userId);
  }
}
