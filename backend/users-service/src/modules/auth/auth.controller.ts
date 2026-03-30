import { Body, Controller, Headers, Post } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { SignupUseCase } from './usecases/signup.usecase';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private signupUseCase: SignupUseCase) {}

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
}
