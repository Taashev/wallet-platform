import { Expose } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import {
  IsISODateString,
  IsOptionalButNotNull,
} from '../../../shared/decorators/validator';
import type { About, DateOfBirth, Email, Username } from '../types/user.type';
import {
  ABOUT_MAX_LENTH,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../user.rules';

export class UpdateUserDto {
  @Expose()
  @IsOptionalButNotNull()
  @IsString()
  @Trim()
  @MaxLength(USERNAME_MAX_LENGTH)
  @MinLength(USERNAME_MIN_LENGTH)
  username?: Username;

  @Expose()
  @IsOptionalButNotNull()
  @IsEmail()
  @Trim()
  @MaxLength(EMAIL_MAX_LENGTH)
  @MinLength(EMAIL_MIN_LENGTH)
  email?: Email;

  @Expose()
  @IsOptionalButNotNull()
  @Trim()
  @IsISODateString()
  dateOfBirth?: DateOfBirth;

  @Expose()
  @IsOptionalButNotNull()
  @IsString()
  @Trim()
  @MaxLength(ABOUT_MAX_LENTH)
  about?: About;
}
