import { ApiPropertyOptional } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import {
  IsISODateString,
  IsOptionalButNotNull,
} from '../../../shared/decorators/validator';
import {
  ABOUT_MAX_LENTH,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../users/constants/user.rules';
import type {
  About,
  DateOfBirth,
  Email,
  Username,
} from '../../users/types/user.type';

export class UpdateUserDto {
  @ApiPropertyOptional({
    minLength: USERNAME_MIN_LENGTH,
    maxLength: USERNAME_MAX_LENGTH,
    example: 'updated_user',
  })
  @Expose()
  @IsOptionalButNotNull()
  @IsString()
  @Trim()
  @MaxLength(USERNAME_MAX_LENGTH)
  @MinLength(USERNAME_MIN_LENGTH)
  username?: Username;

  @ApiPropertyOptional({
    minLength: EMAIL_MIN_LENGTH,
    maxLength: EMAIL_MAX_LENGTH,
    example: 'updated@example.com',
  })
  @Expose()
  @IsOptionalButNotNull()
  @IsEmail()
  @Trim()
  @MaxLength(EMAIL_MAX_LENGTH)
  @MinLength(EMAIL_MIN_LENGTH)
  email?: Email;

  @ApiPropertyOptional({
    format: 'date',
    example: '2000-01-01',
  })
  @Expose()
  @IsOptionalButNotNull()
  @Trim()
  @IsISODateString()
  dateOfBirth?: DateOfBirth;

  @ApiPropertyOptional({
    maxLength: ABOUT_MAX_LENTH,
    example: 'Updated bio',
  })
  @Expose()
  @IsOptionalButNotNull()
  @IsString()
  @Trim()
  @MaxLength(ABOUT_MAX_LENTH)
  about?: About;
}
