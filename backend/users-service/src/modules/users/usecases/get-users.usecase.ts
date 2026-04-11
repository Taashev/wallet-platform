import { Inject, Injectable } from '@nestjs/common';

import type { UsersRepository } from '../interfaces/repository.interface';
import { UserId } from '../types/user.type';
import { USERS_REPOSITORY } from '../users.keys';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
  ) {}

  async execute(userIds: UserId[]) {
    const { users, count } = await this.usersRepository.findByIds(userIds);

    return { users, count };
  }
}
