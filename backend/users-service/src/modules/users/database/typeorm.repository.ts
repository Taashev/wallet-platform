import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../interfaces/repository.interface';
import { CreateUser } from '../types/user.type';

import { UserTypeOrmEntity } from './entities/user-typeorm.entity';

@Injectable()
export class UsersTypeOrmRepository implements UsersRepository {
  constructor(private transactionService: TransactionService) {}

  async create(createUser: CreateUser) {
    const repo =
      this.transactionService.manager.getRepository(UserTypeOrmEntity);

    const user = User.create(createUser);

    const userTypeOrmEntity = repo.create({
      userId: user.userId,
      username: user.username,
      email: user.email,
      password: user.password,
      dateOfBirth: user.dateOfBirth,
      about: user.about,
    });

    await repo.insert(userTypeOrmEntity);

    return user;
  }
}
