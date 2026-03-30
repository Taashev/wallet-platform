import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../modules/auth/auth.module';
import { SessionsModule } from '../modules/sessions/sessions.module';
import { UsersModule } from '../modules/users/users.module';

import { configModuleOptions } from './config/config-options';
import { typeOrmModuleOptions } from './database/typeorm-options';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
    SessionsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
