import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityModule } from '../security/security.module';
import { SessionsModule } from '../sessions/sessions.module';

import { UserTypeOrmEntity } from './database/entities/user-typeorm.entity';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { DeleteCurrentUserUseCase } from './usecases/delete-current-user.usecase';
import { GetCurrentUserUseCase } from './usecases/get-current-user.usecase';
import { GetUsersUseCase } from './usecases/get-users.usecase';
import { UpdateCurrentUserUseCase } from './usecases/update-current-user.usecase';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY } from './users.keys';
import { usersReposirotyProvider } from './users.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTypeOrmEntity]),
    SecurityModule,
    SessionsModule,
  ],
  controllers: [UsersController],
  providers: [
    usersReposirotyProvider,
    GetCurrentUserUseCase,
    GetUsersUseCase,
    DeleteCurrentUserUseCase,
    UpdateCurrentUserUseCase,
    ChangePasswordUseCase,
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
