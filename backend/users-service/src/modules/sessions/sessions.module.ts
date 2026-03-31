import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SessionTypeOrmEntity } from './database/entities/session-typeorm.entity';
import { sessionsRepositoryProvider } from './sessions.providers';
import { SessionsService } from './sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionTypeOrmEntity])],
  providers: [SessionsService, sessionsRepositoryProvider],
  exports: [SessionsService],
})
export class SessionsModule {}
