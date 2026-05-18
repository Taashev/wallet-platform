import { Expose } from 'class-transformer';
import { IsIn } from 'class-validator';

export class CreateAvatarUploadUrlDto {
  @Expose()
  @IsIn(['image/jpeg', 'image/png'])
  contentType!: 'image/jpeg' | 'image/png';
}
