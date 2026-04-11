import { Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { UnauthorizedError } from '../../../shared/errors';
import { SessionsService } from '../../sessions/sessions.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenService } from '../services/token.service';

@Injectable()
export class SignoutUseCase {
  constructor(
    private tokenService: TokenService,
    private sessionsService: SessionsService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto) {
    let sessionId: string;

    try {
      const jwtPayload = this.tokenService.validateRefreshToken(
        refreshTokenDto.refreshToken,
      );

      sessionId = jwtPayload.sessionId;
    } catch {
      throw new UnauthorizedError({
        message: 'Refresh токен не прошел валидацию при выходе',
        safeMessage: ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
        expose: true,
      });
    }

    const isRevoked = await this.sessionsService.revoke(
      sessionId,
      refreshTokenDto.refreshToken,
    );

    if (!isRevoked) {
      throw new UnauthorizedError({
        message: 'Отзыв сессии был отклонен хранилищем сессий',
        safeMessage: ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
        expose: true,
      });
    }
  }
}
