import { User } from '../entities/user.entity';
import { TCreateUser } from '../types/create-user.type';

export interface IUsersRepository {
  create(createUserProps: TCreateUser): Promise<User>;
}
