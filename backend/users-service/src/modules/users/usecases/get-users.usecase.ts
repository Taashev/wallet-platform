import { Inject, Injectable } from '@nestjs/common';

import { PAGINATION_LIMIT_DEFAULT } from '../../../shared/pagination/constants';
import { normalizeOffsetPagination } from '../../../shared/pagination/notmalize-offset-pagination';
import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { USERS_REPOSITORY } from '../constants/users.keys';
import type { UsersRepository } from '../interfaces/users-repository.interface';
import { UserFilter } from '../types/user.type';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
  ) {}

  async execute(filter: UserFilter, pagination?: OffsetPagination) {
    pagination = normalizeOffsetPagination(
      pagination ?? { limit: PAGINATION_LIMIT_DEFAULT, offset: 0 },
    );

    const { users, count } = await this.usersRepository.findManyByFilter(
      filter,
      pagination,
    );

    return { users, count };
  }
}
