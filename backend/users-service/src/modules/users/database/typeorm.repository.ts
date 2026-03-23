import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { IUsersRepository } from '../interfaces/repository.interface';
import { TCreateUser } from '../types/create-user.type';

import { UserTypeOrmEntity } from './entities/user-typeorm.entity';

@Injectable()
export class UsersTypeOrmRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private usersRepository: Repository<UserTypeOrmEntity>,
  ) {}

  async create(createUser: TCreateUser) {
    const user = User.create(createUser);

    const createdUser = this.usersRepository.create(user);

    await this.usersRepository.insert(createdUser);

    return user;
  }
}
