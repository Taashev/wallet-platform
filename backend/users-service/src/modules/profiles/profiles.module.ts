import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module';

import { ProfileQueryRepositoryProvider } from './constants/profile.provider';
import { ProfileCacheService } from './profile-cache.service';
import { ProfilesController } from './profiles.controller';
import { FindActiveProfilesUseCase } from './usecases/find-active-profiles.usecase';
import { GetCurrentProfileUseCase } from './usecases/get-current-profile.usecase';
import { GetProfilesUseCase } from './usecases/get-profiles.usecase';

@Module({
  imports: [SecurityModule],
  controllers: [ProfilesController],
  providers: [
    ProfileQueryRepositoryProvider,
    ProfileCacheService,
    FindActiveProfilesUseCase,
    GetCurrentProfileUseCase,
    GetProfilesUseCase,
  ],
  exports: [ProfileCacheService],
})
export class ProfilesModule {}
