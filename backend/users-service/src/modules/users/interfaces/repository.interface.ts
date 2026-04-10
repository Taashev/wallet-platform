import { User } from '../entities/user.entity';
import { CreateUser, Username } from '../types/user.type';

export interface UsersRepository {
  create(createUserProps: CreateUser): Promise<User>;

  findOneByUsername(username: Username): Promise<User | null>;
}
