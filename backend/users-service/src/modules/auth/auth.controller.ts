import { Body, Controller, Headers, Post } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { AuthLocalDto } from './dto/authLocal.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { SigninUseCase } from './usecases/signin.usecase';
import { SignupUseCase } from './usecases/signup.usecase';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private signupUseCase: SignupUseCase,
    private signinUseCase: SigninUseCase,
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
}
