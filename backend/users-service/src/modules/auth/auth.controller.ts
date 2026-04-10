import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { AuthLocalDto } from './dto/auth-local.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseUserDto } from './dto/response-user.dto';
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
    const { user, accessToken, refreshToken } =
      await this.signupUseCase.execute(createUserDto, userAgent);

    const sanitazedUser = plainToInstance(
      ResponseUserDto,
      { ...user, age: user.age },
      {
        excludeExtraneousValues: true,
      },
    );

    return { user: sanitazedUser, accessToken, refreshToken };
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
  @Post('/signout')
  async signout(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.signoutUseCase.execute(refreshTokenDto);
  }
}
