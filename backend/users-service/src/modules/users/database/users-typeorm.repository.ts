import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../interfaces/repository.interface';
import type {
  CreateUser,
  FindOneUserCriteria,
  UserFilter,
  UserId,
  Username,
} from '../types/user.type';

import { userPostgresErrorMap } from './constants';
import { UserTypeOrmEntity } from './entities/user-typeorm.entity';

@Injectable()
@MapPostgresErrorToAppError(userPostgresErrorMap)
export class UsersTypeOrmRepository implements UsersRepository {
  constructor(private transactionService: TransactionService) {}

  async create(createUser: CreateUser) {
    const repository =
      this.transactionService.manager.getRepository(UserTypeOrmEntity);

    const user = User.create(createUser);

    const userTypeOrmEntity = repository.create({
      userId: user.userId,
      username: user.username,
      email: user.email,
      password: user.password,
      dateOfBirth: user.dateOfBirth,
      about: user.about,
    });

    await repository.insert(userTypeOrmEntity);

    return user;
  }

  async findManyByFilter(filter: UserFilter, pagination: OffsetPagination) {
    const repository =
      this.transactionService.manager.getRepository(UserTypeOrmEntity);

    const queryBuilder = repository.createQueryBuilder('user');

    if (filter.username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: filter.username + '%',
      });
    }

    queryBuilder.orderBy('user_id', 'ASC');

    queryBuilder.skip(pagination.offset);
    queryBuilder.take(pagination.limit);

    const [userTypeOrmEntities, count] = await queryBuilder.getManyAndCount();

    const users = userTypeOrmEntities.map((userTypeormEntity) =>
      User.restore(userTypeormEntity),
    );

    return { users, count };
  }

  private async findOneBy(
    criterial: FindOneUserCriteria,
  ): Promise<User | null> {
    const repository =
      this.transactionService.manager.getRepository(UserTypeOrmEntity);

    const userTypeOrmEntity = await repository.findOneBy(criterial);

    return userTypeOrmEntity ? User.restore(userTypeOrmEntity) : null;
  }

  async findOneByUserId(userId: UserId): Promise<User | null> {
    return await this.findOneBy({ userId });
  }

  async findOneByUsername(username: Username): Promise<User | null> {
    return await this.findOneBy({ username });
  }
}
