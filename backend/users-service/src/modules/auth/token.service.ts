import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import jsonwebtoken from 'jsonwebtoken';

import { AuthConfigType, ConfigType } from '../../infrastructure/config';

@Injectable()
export class TokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpireIn: number;
  private refreshTokenExpireIn: number;

  constructor(private config: ConfigService<ConfigType>) {
    const authConfig = this.config.getOrThrow<AuthConfigType>('auth');

    this.accessTokenSecret = authConfig.ACCESS_TOKEN_SECRET;
    this.accessTokenExpireIn = authConfig.ACCESS_TOKEN_EXPIRE_IN;

    this.refreshTokenSecret = authConfig.REFRESH_TOKEN_SECRET;
    this.refreshTokenExpireIn = authConfig.REFRESH_TOKEN_EXPIRE_IN;
  }

  createAccessToken(payload: { userId: string }) {
    const jwt = jsonwebtoken.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpireIn,
    });

    return jwt;
  }

  createRefreshToken() {
    const jwt = jsonwebtoken.sign({}, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpireIn,
    });

    return jwt;
  }

  validateAccessToken(jwt: string, type: 'access' | 'refresh') {
    if (type === 'access') {
      return jsonwebtoken.verify(jwt, this.accessTokenSecret);
    } else {
      return jsonwebtoken.verify(jwt, this.refreshTokenSecret);
    }
  }
}
