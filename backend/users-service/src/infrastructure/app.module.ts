import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../modules/auth/auth.module';
import { AvatarsModule } from '../modules/avatars/avatars.module';
import { ProfilesModule } from '../modules/profiles/profiles.module';
import { SecurityModule } from '../modules/security/security.module';
import { SessionsModule } from '../modules/sessions/sessions.module';
import { UsersModule } from '../modules/users/users.module';

import { bullmqModuleOptions } from './bullmq/bullmq-options';
import { configModuleOptions } from './config/config-options';
import { typeOrmModuleOptions } from './database/typeorm-options';
import { FileStorageModule } from './file-storage/file-storage.module';
import { redisModuleOptions } from './redis/redis-options';
import { RedisModule } from './redis/redis.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    RedisModule.forRootAsync(redisModuleOptions),
    BullModule.forRootAsync(bullmqModuleOptions),
    FileStorageModule.forRoot(),
    SecurityModule,
    UsersModule,
    SessionsModule,
    AuthModule,
    TransactionModule,
    AvatarsModule,
    ProfilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
