import { Module } from '@nestjs/common';

import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { SignupUseCase } from './usecases/signup.usecase';

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [TokenService, PasswordService, SignupUseCase],
})
export class AuthModule {}
