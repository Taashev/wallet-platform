import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as bcrypt from 'bcrypt';

import { AppConfigType, ConfigType } from '../../infrastructure/config';

@Injectable()
export class PasswordService {
  constructor(private config: ConfigService<ConfigType>) {}

  async hash(password: string) {
    const appConfig = this.config.getOrThrow<AppConfigType>('app');

    const salt = appConfig.PASSWORD_SALT;

    return await bcrypt.hash(password, salt);
  }
}
