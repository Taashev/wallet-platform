import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserTypeOrmEntity } from './database/entities/user-typeorm.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeOrmEntity])],
})
export class UsersModule {}
