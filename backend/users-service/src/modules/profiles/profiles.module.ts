import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';

import { ProfileQueryRepositoryProvider } from './constants/profile.provider';
import { ProfileCacheService } from './profile-cache.service';
import { ProfilesController } from './profiles.controller';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { DeleteCurrentUserUseCase } from './usecases/delete-current-user.usecase';
import { FindActiveProfilesUseCase } from './usecases/find-active-profiles.usecase';
import { GetCurrentProfileUseCase } from './usecases/get-current-profile.usecase';
import { GetProfilesUseCase } from './usecases/get-profiles.usecase';
import { UpdateCurrentUserUseCase } from './usecases/update-current-user.usecase';

@Module({
  imports: [SecurityModule, SessionsModule, UsersModule],
  controllers: [ProfilesController],
  providers: [
    ProfileQueryRepositoryProvider,
    ProfileCacheService,
    FindActiveProfilesUseCase,
    GetCurrentProfileUseCase,
    GetProfilesUseCase,
    UpdateCurrentUserUseCase,
    ChangePasswordUseCase,
    DeleteCurrentUserUseCase,
  ],
  exports: [ProfileCacheService],
})
export class ProfilesModule {}
