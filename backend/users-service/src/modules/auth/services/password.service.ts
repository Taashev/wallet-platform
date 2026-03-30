import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import { AppConfigType, ConfigType } from '../../../infrastructure/config';

@Injectable()
export class PasswordService {
  salt: number;

  constructor(private config: ConfigService<ConfigType>) {
    const appConfig = this.config.getOrThrow<AppConfigType>('app');

    this.salt = appConfig.PASSWORD_SALT;
  }

  async hash(password: string) {
    return await bcrypt.hash(password, this.salt);
  }
}
