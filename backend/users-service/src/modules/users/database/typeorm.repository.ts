import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { IUsersRepository } from '../interfaces/repository.interface';

import { UserTypeOrmEntity } from './entities/user-typeorm.entity';

@Injectable()
export class UsersTypeOrmRepository implements IUsersRepository {
  constructor(
    @InjectRepository(UserTypeOrmEntity)
    private usersRepository: Repository<UserTypeOrmEntity>,
  ) {}
}
