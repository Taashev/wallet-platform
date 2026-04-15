import { Expose } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import type { Password } from '../types/user.type';
import { PASSWORD_MAX_LENTH, PASSWORD_MIN_LENTH } from '../user.rules';

export class ChangePasswordDto {
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  newPassword!: Password;

  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  oldPassword!: Password;
}
