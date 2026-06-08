import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

export class DeleteAvatarParamsDto {
  @Expose()
  @IsUUID('4')
  avatarId!: string;
}
