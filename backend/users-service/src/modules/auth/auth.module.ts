import { Module } from '@nestjs/common';

import { SecurityModule } from '../security/security.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';

import { AuthController } from './auth.controller';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { SigninUseCase } from './usecases/signin.usecase';
import { SignoutUseCase } from './usecases/signout.usecase';
import { SignupUseCase } from './usecases/signup.usecase';

@Module({
  imports: [UsersModule, WalletModule, SessionsModule, SecurityModule],
  controllers: [AuthController],
  providers: [
    SignupUseCase,
    SigninUseCase,
    RefreshTokenUseCase,
    SignoutUseCase,
  ],
})
export class AuthModule {}
