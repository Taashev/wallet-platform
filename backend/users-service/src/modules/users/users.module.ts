import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { USERS_REPOSITORY } from './constants/users.keys';
import { UsersReposirotyProvider } from './constants/users.provider';
import { UserTypeOrmEntity } from './database/entities/user-typeorm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],

  providers: [UsersReposirotyProvider],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
