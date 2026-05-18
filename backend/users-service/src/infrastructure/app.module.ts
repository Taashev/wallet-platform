import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../modules/auth/auth.module';
import { AvatarsModule } from '../modules/avatars/avatars.module';
import { SecurityModule } from '../modules/security/security.module';
import { SessionsModule } from '../modules/sessions/sessions.module';
import { UsersModule } from '../modules/users/users.module';

import { configModuleOptions } from './config/config-options';
import { typeOrmModuleOptions } from './database/typeorm-options';
import { FileStorageModule } from './file-storage/file-storage.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    FileStorageModule.forRoot(),
    SecurityModule,
    UsersModule,
    SessionsModule,
    AuthModule,
    TransactionModule,
    AvatarsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
