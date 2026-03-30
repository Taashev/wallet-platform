import { User } from '../entities/user.entity';
import { CreateUser } from '../types/user.type';

export interface UsersRepository {
  create(createUserProps: CreateUser): Promise<User>;
}
