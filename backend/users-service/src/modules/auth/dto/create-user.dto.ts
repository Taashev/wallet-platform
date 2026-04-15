import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
import type {
  About,
  DateOfBirth,
  Email,
  Password,
  Username,
} from '../../users/types/user.type';
import {
  ABOUT_MAX_LENTH,
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENTH,
  PASSWORD_MIN_LENTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../users/user.rules';

export class CreateUserDto {
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
    maxLength: EMAIL_MAX_LENGTH,
    example: 'user@example.com',
  })
  @Expose()
  @IsEmail()
  @Trim()
  @MaxLength(EMAIL_MAX_LENGTH)
  email!: Email;

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

  @ApiPropertyOptional({
    format: 'date',
    example: '1999-12-31',
  })
  @Expose()
  @IsOptional()
  @Trim()
  @IsISODateString()
  dateOfBirth?: DateOfBirth;

  @ApiPropertyOptional({
    maxLength: ABOUT_MAX_LENTH,
    example: 'Backend engineer',
  })
  @Expose()
  @IsOptional()
  @Trim()
  @MaxLength(ABOUT_MAX_LENTH)
  about?: About;
}
