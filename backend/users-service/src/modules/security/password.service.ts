import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import { ConfigType, SecurityConfigType } from '../../infrastructure/config';

@Injectable()
export class PasswordService {
  private salt: number;

  constructor(private config: ConfigService<ConfigType>) {
    const securityConfig =
      this.config.getOrThrow<SecurityConfigType>('security');

    this.salt = securityConfig.passwordSaltRounds;
  }

  async hash(password: string) {
    return await bcrypt.hash(password, this.salt);
  }

  async compare(password: string, hashPassword: string) {
    return await bcrypt.compare(password, hashPassword);
  }
}
