import { Inject, Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';

import type { IUsersRepository } from '../../users/interfaces/repository.interface';
import { USERS_REPOSITORY } from '../../users/users.keys';
import { CreateUserDto } from '../dto/create-user.dto';
import { ResponseUserDto } from '../dto/response-user.dto';
import { PasswordService } from '../password.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: IUsersRepository,
    private passwordService: PasswordService,
  ) {}

  async execute(createUserDto: CreateUserDto) {
    const passwordHash = await this.passwordService.hash(
      createUserDto.password,
    );

    const userId = crypto.randomUUID();

    const user = await this.usersRepository.create({
      userId,
      username: createUserDto.username,
      email: createUserDto.email,
      password: passwordHash,
      about: createUserDto.about,
      dateOfBirth: createUserDto.dateOfBirth,
    });

    const sanitazedUser = plainToInstance(
      ResponseUserDto,
      { ...user, age: user.getAge() },
      {
        excludeExtraneousValues: true,
      },
    );

    return sanitazedUser;
  }
}
