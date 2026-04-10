import { Injectable, UnauthorizedException } from '@nestjs/common';

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
      throw new UnauthorizedException('Невалидный refresh токен');
    }

    const isRevoked = await this.sessionsService.revoke(
      sessionId,
      refreshTokenDto.refreshToken,
    );

    if (!isRevoked) {
      throw new UnauthorizedException('Невалидный refresh токен');
    }
  }
}
