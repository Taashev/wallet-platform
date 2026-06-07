import { Expose } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';
import { ORIGINAL_NAME_MAX_LENGTH } from '../avatars.rules';
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  AVATAR_MIN_SIZE_BYTES,
} from '../constants/avatar-constants';

export class InitUploadAvatarDto {
  @Expose()
  @IsIn(AVATAR_ALLOWED_MIME_TYPES)
  contentType!: (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

  @Expose()
  @IsInt()
  @Min(AVATAR_MIN_SIZE_BYTES)
  @Max(AVATAR_MAX_SIZE_BYTES)
  fileSizeBytes!: number;

  @Expose()
  @Trim()
  @IsString()
  @MinLength(1)
  @MaxLength(ORIGINAL_NAME_MAX_LENGTH)
  originalName!: string;
}
