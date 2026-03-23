import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';

import { AuthController } from './auth.controller';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { CreateUserUseCase } from './usecases/create-user.usecase';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [TokenService, PasswordService, CreateUserUseCase],
})
export class AuthModule {}
