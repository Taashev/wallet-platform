import { Injectable } from '@nestjs/common';

import { SessionsService } from '../../sessions/sessions.service';
import { CurrentUserType } from '../../users/types/user.type';

@Injectable()
export class SignoutUseCase {
  constructor(private sessionsService: SessionsService) {}

  async execute(currentUser: CurrentUserType) {
    const isRevoked = await this.sessionsService.revokeBySessionId(
      currentUser.sessionId,
    );

    if (!isRevoked) {
      console.log(
        `Сессий ${currentUser.sessionId} для пользователя ${currentUser.userId} уже была отозвана ранее`,
      );
    }
  }
}
