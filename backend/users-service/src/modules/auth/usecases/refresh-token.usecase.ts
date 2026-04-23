import { Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { UnauthorizedError } from '../../../shared/errors';
import { TokenService } from '../../security/token.service';
import { SessionsService } from '../../sessions/sessions.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private tokenService: TokenService,
    private sessionsService: SessionsService,
  ) {}

  async execute(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken: currentRefreshToken } = refreshTokenDto;

    let sessionId: string;
    let userId: string;

    try {
      const jwtPayload =
        this.tokenService.validateRefreshToken(currentRefreshToken);

      sessionId = jwtPayload.sessionId;
      userId = jwtPayload.userId;
    } catch {
      throw new UnauthorizedError({
        message: 'Refresh токен не прошел валидацию',
        safeMessage: ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
        expose: true,
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.tokenService.createAuthTokens({
        sessionId,
        userId,
      });

    const isUpdate = await this.sessionsService.rotateRefreshToken(
      sessionId,
      currentRefreshToken,
      newRefreshToken,
    );

    if (!isUpdate) {
      throw new UnauthorizedError({
        message:
          'Обновление refresh токена было отклонено хранилищем сессий.' +
          ' Причина может быть: сессия отозвана, просрочена, не найдена или токен не действителен.' +
          ' Этот случай нужно обрабатывать и логировать отдельно и решать, что делать например отзывать сессию клиента или нет',
        safeMessage: ERROR_MESSAGES.INVALID_REFRESH_TOKEN,
        expose: true,
      });
    }

    return { accessToken, refreshToken: newRefreshToken };
  }
}
