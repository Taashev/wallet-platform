import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { UsersRepository } from '../interfaces/repository.interface';
import { CreateUser } from '../types/user.type';

import { UserTypeOrmEntity } from './entities/user-typeorm.entity';

@Injectable()
export class UsersTypeOrmRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private usersRepository: Repository<UserTypeOrmEntity>,
  ) {}

  async create(createUser: CreateUser) {
    const user = User.create(createUser);

    const userTypeOrmEntity = this.usersRepository.create({
      userId: user.userId,
      username: user.username,
      email: user.email,
      password: user.password,
      dateOfBirth: user.dateOfBirth,
      about: user.about,
    });

    await this.usersRepository.insert(userTypeOrmEntity);

    return user;
  }
}
