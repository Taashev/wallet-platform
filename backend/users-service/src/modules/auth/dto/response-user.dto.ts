import { Exclude, Expose } from 'class-transformer';

import type {
  About,
  Email,
  UserId,
  Username,
} from '../../users/types/user.type';

export class ResponseUserDto {
  @Expose({ groups: ['public', 'private'] })
  userId!: UserId;

  @Expose({ groups: ['public', 'private'] })
  username!: Username;

  @Expose({ groups: ['private'] })
  email!: Email;

  @Exclude()
  password!: string;

  @Expose({ groups: ['public', 'private'] })
  about!: About;

  @Expose({ groups: ['public', 'private'] })
  age!: number;
}
