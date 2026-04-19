import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import jsonwebtoken from 'jsonwebtoken';

import { AuthConfigType, ConfigType } from '../../infrastructure/config';

import { AccessTokenPayload, RefreshTokenPayload } from './types/token.type';

@Injectable()
export class TokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpireIn: number;
  private refreshTokenExpireIn: number;

  constructor(private config: ConfigService<ConfigType>) {
    const authConfig = this.config.getOrThrow<AuthConfigType>('auth');

    this.accessTokenSecret = authConfig.accessToken.secret;
    this.accessTokenExpireIn = authConfig.accessToken.ttlSeconds;

    this.refreshTokenSecret = authConfig.refreshToken.secret;
    this.refreshTokenExpireIn = authConfig.refreshToken.ttlSeconds;
  }

  private createAccessToken(payload: AccessTokenPayload) {
    const jwt = jsonwebtoken.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpireIn,
    });

    return jwt;
  }

  private createRefreshToken(payload: RefreshTokenPayload) {
    const jwt = jsonwebtoken.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpireIn,
    });

    return jwt;
  }

  createAuthTokens(payload: AccessTokenPayload & RefreshTokenPayload) {
    const accessToken = this.createAccessToken({
      sessionId: payload.sessionId,
      userId: payload.userId,
    });

    const refreshToken = this.createRefreshToken({
      sessionId: payload.sessionId,
      userId: payload.userId,
    });

    return { accessToken, refreshToken } as const;
  }

  validateAccessToken(jwt: string) {
    return jsonwebtoken.verify(
      jwt,
      this.accessTokenSecret,
    ) as AccessTokenPayload;
  }

  validateRefreshToken(jwt: string) {
    return jsonwebtoken.verify(
      jwt,
      this.refreshTokenSecret,
    ) as RefreshTokenPayload;
  }
}
