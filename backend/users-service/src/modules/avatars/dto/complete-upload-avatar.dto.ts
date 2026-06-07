import { IsUUID } from 'class-validator';

import { Trim } from '../../../shared/decorators/transformers';

export class CompleteUploadAvatarDto {
  @IsUUID('4')
  @Trim()
  avatarId!: string;
}
