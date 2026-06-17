import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import {
  PASSWORD_MAX_LENTH,
  PASSWORD_MIN_LENTH,
} from '../../users/constants/user.rules';
import type { Password } from '../../users/types/user.type';

export class ChangePasswordDto {
  @ApiProperty({
    minLength: PASSWORD_MIN_LENTH,
    maxLength: PASSWORD_MAX_LENTH,
    example: 'NewStrongPass123',
  })
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  newPassword!: Password;

  @ApiProperty({
    minLength: PASSWORD_MIN_LENTH,
    maxLength: PASSWORD_MAX_LENTH,
    example: 'OldStrongPass123',
  })
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  oldPassword!: Password;
}
