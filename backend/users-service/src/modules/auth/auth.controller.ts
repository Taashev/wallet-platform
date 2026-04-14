import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../shared/decorators/current-user';
import type { CurrentUserType } from '../users/types/user.type';

import { AuthLocalDto } from './dto/auth-local.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { SigninUseCase } from './usecases/signin.usecase';
import { SignoutUseCase } from './usecases/signout.usecase';
import { SignupUseCase } from './usecases/signup.usecase';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private signupUseCase: SignupUseCase,
    private signinUseCase: SigninUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private signoutUseCase: SignoutUseCase,
  ) {}

  @Post('/signup')
  async createUser(
    @Headers('User-Agent') userAgent: string | undefined,
    @Body() createUserDto: CreateUserDto,
  ) {
    const { accessToken, refreshToken } = await this.signupUseCase.execute(
      createUserDto,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  @Post('/signin')
  async authLocal(
    @Headers('User-Agent') userAgent: string | undefined,
    @Body() authLocalDto: AuthLocalDto,
  ) {
    const { accessToken, refreshToken } = await this.signinUseCase.execute(
      authLocalDto,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.refreshTokenUseCase.execute(refreshTokenDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  @Post('/signout')
  async signout(@CurrentUser() currentUser: CurrentUserType) {
    return await this.signoutUseCase.execute(currentUser);
  }
}
