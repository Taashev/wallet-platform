import { User } from '../entities/user.entity';
import {
  CreateUser,
  Password,
  UpdateUser,
  UserId,
  Username,
} from '../types/user.type';

export interface UsersRepository {
  create(createUserProps: CreateUser): Promise<User>;

  lockById(userId: UserId, options?: { nowait?: boolean }): Promise<void>;

  findOneByUsername(username: Username): Promise<User | null>;

  findOneByUserId(userId: UserId): Promise<User | null>;

  softDelete(userId: UserId): Promise<boolean>;

  updateUser(
    userId: UserId,
    updatedUser: UpdateUser & { passwordHash?: Password },
  ): Promise<boolean>;
}
