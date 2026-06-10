import { ApiPropertyOptional } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import { USERNAME_MAX_LENGTH } from '../../users/constants/user.rules';
import type { Username } from '../../users/types/user.type';

export class ProfileFilterDto {
  @ApiPropertyOptional({
    maxLength: USERNAME_MAX_LENGTH,
    example: 'user',
  })
  @Expose()
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username?: Username;
}
