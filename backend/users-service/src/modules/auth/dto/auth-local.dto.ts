import { Expose } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import type { Password, Username } from '../../users/types/user.type';
import {
  PASSWORD_MAX_LENTH,
  PASSWORD_MIN_LENTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../users/user.rules';

export class AuthLocalDto {
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(USERNAME_MAX_LENGTH)
  @MinLength(USERNAME_MIN_LENGTH)
  username!: Username;

  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  password!: Password;
}
