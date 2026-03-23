import { User } from '../../domain/entities/user.entity';

export interface IUsersRepository {
  create(): User;
}
