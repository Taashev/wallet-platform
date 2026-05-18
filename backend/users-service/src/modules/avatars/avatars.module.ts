import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module';

import { AvatarsController } from './avatars.controller';
import { GetUploadAvatarUrlUseCase } from './usecases/upload-avatar.usecase';

@Module({
  imports: [SecurityModule],
  controllers: [AvatarsController],
  providers: [GetUploadAvatarUrlUseCase],
})
export class AvatarsModule {}
