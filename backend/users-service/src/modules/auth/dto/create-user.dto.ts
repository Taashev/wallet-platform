import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import { IsISODateString } from '../../../shared/decorators/validator';
import {
  ABOUT_MAX_LENTH,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENTH,
  PASSWORD_MIN_LENTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../users/user.rules';

export class CreateUserDto {
  @Expose()
  @IsString()
  @Trim()
  @MaxLength(USERNAME_MAX_LENGTH)
  @MinLength(USERNAME_MIN_LENGTH)
  username: string;

  @Expose()
  @IsEmail()
  @Trim()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @Expose()
  @IsString()
  @Trim()
  @MaxLength(PASSWORD_MAX_LENTH)
  @MinLength(PASSWORD_MIN_LENTH)
  password: string;

  @Expose()
  @IsOptional()
  @Trim()
  @IsISODateString()
  dateOfBirth?: string;

  @Expose()
  @IsOptional()
  @Trim()
  @MaxLength(ABOUT_MAX_LENTH)
  about?: string;
}
