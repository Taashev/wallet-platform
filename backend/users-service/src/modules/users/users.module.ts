import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTypeOrmEntity } from './database/entities/user-typeorm.entity';
import { USERS_REPOSITORY } from './users.keys';
import { usersReposirotyProvider } from './users.provider';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
  providers: [usersReposirotyProvider],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
