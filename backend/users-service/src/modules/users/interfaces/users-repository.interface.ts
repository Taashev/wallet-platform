import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { User } from '../entities/user.entity';
import {
  CreateUser,
  Password,
  UpdateUser,
  UserFilter,
  UserId,
  Username,
} from '../types/user.type';

export interface UsersRepository {
  create(createUserProps: CreateUser): Promise<User>;

  lockById(userId: UserId, options?: { nowait?: boolean }): Promise<void>;

  findOneByUsername(username: Username): Promise<User | null>;

  findOneByUserId(userId: UserId): Promise<User | null>;

  findManyByFilter(
    filter: UserFilter,
    pagination: OffsetPagination,
  ): Promise<{ users: User[]; count: number }>;

  softDelete(userId: UserId): Promise<boolean>;

  updateUser(
    userId: UserId,
    updatedUser: UpdateUser & { passwordHash?: Password },
  ): Promise<boolean>;
}
