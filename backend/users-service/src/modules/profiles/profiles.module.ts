import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module';

import { ProfileQueryRepositoryProvider } from './constants/profile.provider';
import { ProfilesController } from './profiles.controller';
import { FindActiveProfilesUseCase } from './usecases/find-active-profiles.usecase';

@Module({
  imports: [SecurityModule],
  controllers: [ProfilesController],
  providers: [ProfileQueryRepositoryProvider, FindActiveProfilesUseCase],
})
export class ProfilesModule {}
