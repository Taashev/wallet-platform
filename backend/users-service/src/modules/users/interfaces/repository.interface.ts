import { User } from '../entities/user.entity';

export interface IUsersRepository {
  create(): User;
}
