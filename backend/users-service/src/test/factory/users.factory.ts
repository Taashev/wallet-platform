import { User } from '../../modules/users/entities/user.entity';
import { UsersRepository } from '../../modules/users/interfaces/users-repository.interface';
import {
  dateOfBirthMock,
  emailMock,
  passwordHashMock,
  userIdMock,
  usernameMock,
} from '../mocks';

export type UsersRepositoryMock = jest.Mocked<
  Pick<
    UsersRepository,
    | 'create'
    | 'findManyByFilter'
    | 'findOneByUserId'
    | 'findOneByUsername'
    | 'softDelete'
    | 'updateUser'
  >
>;

export const createUsersRepositoryMock = (): UsersRepositoryMock => ({
  create: jest.fn(),
  findManyByFilter: jest.fn(),
  findOneByUserId: jest.fn(),
  findOneByUsername: jest.fn(),
  softDelete: jest.fn(),
  updateUser: jest.fn(),
});

export const createUserMock = (
  props: {
    userId?: string;
    username?: string;
    email?: string;
    passwordHash?: string;
  } = {},
): User =>
  User.create({
    userId: props.userId ?? userIdMock,
    username: props.username ?? usernameMock,
    email: props.email ?? emailMock,
    password: props.passwordHash ?? passwordHashMock,
    dateOfBirth: dateOfBirthMock,
    about: null,
  });
