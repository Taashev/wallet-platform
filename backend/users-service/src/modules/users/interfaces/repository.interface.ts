import { User } from '../entities/user.entity';
import { CreateUser, UserId, Username } from '../types/user.type';

export interface UsersRepository {
  create(createUserProps: CreateUser): Promise<User>;

  findOneByUsername(username: Username): Promise<User | null>;

  findByIds(userIds: UserId[]): Promise<{ users: User[]; count: number }>;
}
