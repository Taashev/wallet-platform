import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../interfaces/repository.interface';
import type { CreateUser, UserId, Username } from '../types/user.type';

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

  async findOneByUsername(username: Username): Promise<User | null> {
    const repository =
      this.transactionService.manager.getRepository(UserTypeOrmEntity);

    const userTypeOrmEntity = await repository.findOneBy({
      username,
    });

    const user = userTypeOrmEntity ? User.restore(userTypeOrmEntity) : null;

    return user;
  }

  async findByIds(
    userIds: UserId[],
  ): Promise<{ users: User[]; count: number }> {
    const repository =
      this.transactionService.manager.getRepository(UserTypeOrmEntity);

    const [userTypeOrmEntities, count] = await repository.findAndCount({
      where: userIds.map((userId) => ({ userId })),
    });

    const users = userTypeOrmEntities.map((userTypeormEntity) =>
      User.restore(userTypeormEntity),
    );

    return { users, count };
  }
}
