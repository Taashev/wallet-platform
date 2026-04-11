import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SecurityModule } from '../security/security.module';

import { UserTypeOrmEntity } from './database/entities/user-typeorm.entity';
import { GetUsersUseCase } from './usecases/get-users.usecase';
import { UsersController } from './users.controller';
import { USERS_REPOSITORY } from './users.keys';
import { usersReposirotyProvider } from './users.provider';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity]), SecurityModule],
  controllers: [UsersController],
  providers: [usersReposirotyProvider, GetUsersUseCase],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
