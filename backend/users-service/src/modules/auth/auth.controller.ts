import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { TokenService } from './token.service';
import { CreateUserUseCase } from './usecases/create-user.usecase';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private tokenService: TokenService,
  ) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(createUserDto);

    const accessToken = this.tokenService.createAccessToken({
      userId: user.userId,
    });

    const refreshToken = this.tokenService.createRefreshToken();

    return { accessToken, refreshToken, user };
  }
}
