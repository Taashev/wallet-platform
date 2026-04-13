import { Expose } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import type { Username } from '../types/user.type';
import { USERNAME_MAX_LENGTH } from '../user.rules';

export class UserFilterDto {
  @Expose()
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username?: Username;
}
