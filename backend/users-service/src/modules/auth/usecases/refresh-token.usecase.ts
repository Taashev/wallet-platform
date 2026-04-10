import { Injectable, UnauthorizedException } from '@nestjs/common';

import { SessionsService } from '../../sessions/sessions.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenService } from '../services/token.service';

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
      throw new UnauthorizedException('Невалидный refresh токен');
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
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    return { accessToken, refreshToken: newRefreshToken };
  }
}
