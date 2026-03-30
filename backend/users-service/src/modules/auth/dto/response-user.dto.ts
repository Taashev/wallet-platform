import { Expose } from 'class-transformer';

import type {
  About,
  Email,
  UserId,
  Username,
} from '../../users/types/user.type';

export class ResponseUserDto {
  @Expose()
  userId: UserId;

  @Expose()
  username: Username;

  @Expose()
  email: Email;

  @Expose()
  about: About;

  @Expose()
  age: number;
}
