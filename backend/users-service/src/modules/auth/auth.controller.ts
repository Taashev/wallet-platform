import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUseCase } from './usecases/create-user.usecase';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  @Post('/signup')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.createUserUseCase.execute(createUserDto);
  }
}
