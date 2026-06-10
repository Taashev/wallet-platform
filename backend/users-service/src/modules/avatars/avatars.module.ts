import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityModule } from '../security/security.module';
import { UsersModule } from '../users/users.module';

import { AvatarsController } from './avatars.controller';
import {
  AVATARS_REPOSITORY,
  UPLOAD_AVATAR_QUEUE_NAME,
} from './constants/avatar.keys';
import { AvatarsRepositoryProvider } from './constants/avatars.provider';
import { AvatarTypeOrmEntity } from './database/entities/avatar-typeorm.entity';
import { AvatarProducer } from './producers/avatar.producer';
import { DeleteAvatarUseCase } from './usecases/delete-avatar.usecase';
import { UploadAvatarUseCase } from './usecases/upload-avatar.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvatarTypeOrmEntity]),
    BullModule.registerQueue({
      name: UPLOAD_AVATAR_QUEUE_NAME,
    }),
    SecurityModule,
    UsersModule,
  ],
  controllers: [AvatarsController],
  providers: [
    AvatarsRepositoryProvider,
    AvatarProducer,
    UploadAvatarUseCase,
    DeleteAvatarUseCase,
  ],
  exports: [AVATARS_REPOSITORY],
})
export class AvatarsModule {}
