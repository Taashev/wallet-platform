import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    minLength: USERNAME_MIN_LENGTH,
    maxLength: USERNAME_MAX_LENGTH,
    example: 'user',
  })
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(USERNAME_MAX_LENGTH)
  @MinLength(USERNAME_MIN_LENGTH)
  username!: Username;

  @ApiProperty({
    minLength: PASSWORD_MIN_LENTH,
    maxLength: PASSWORD_MAX_LENTH,
    example: 'StrongPass123',
  })
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  password!: Password;
}
