import { Entity } from 'typeorm';

@Entity({ name: 'users' })
export class UserTypeOrmEntity {
  userId: string;

  createdAt: Date;

  updatedAt: Date;

  username: string;

  email: string;

  password: string;

  dateOfBirth: string;

  about: string;
}
