import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UPLOAD_AVATAR_QUEUE_NAME } from './constants/avatar.keys';
import { AvatarsRepositoryProvider } from './constants/avatars.provider';
import { AvatarTypeOrmEntity } from './database/entities/avatar-typeorm.entity';
import { AvatarProcessor } from './jobs/avatar.processor';
import { ProcessAvatarUseCase } from './usecases/process-avatar.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([AvatarTypeOrmEntity]),
    BullModule.registerQueue({
      name: UPLOAD_AVATAR_QUEUE_NAME,
    }),
  ],
  providers: [AvatarsRepositoryProvider, AvatarProcessor, ProcessAvatarUseCase],
})
export class AvatarsWorkerModule {}
