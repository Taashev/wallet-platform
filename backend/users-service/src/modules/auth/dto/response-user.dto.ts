import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose } from 'class-transformer';

import type {
  About,
  Email,
  UserId,
  Username,
} from '../../users/types/user.type';

export class ResponseUserDto {
  @ApiProperty({ example: '8e27fcf1-7dfb-4ea5-a4f8-3db0884fa9d6' })
  @Expose({ groups: ['public', 'private'] })
  userId!: UserId;

  @ApiProperty({ example: 'user' })
  @Expose({ groups: ['public', 'private'] })
  username!: Username;

  @ApiProperty({ example: 'user@example.com' })
  @Expose({ groups: ['private'] })
  email!: Email;

  @Exclude()
  password!: string;

  @ApiProperty({ example: 'Backend engineer' })
  @Expose({ groups: ['public', 'private'] })
  about!: About;

  @ApiProperty({ example: '1999-12-31' })
  @Expose({ groups: ['private'] })
  dateOfBirth!: string;

  @ApiProperty({ example: 26 })
  @Expose({ groups: ['public', 'private'] })
  age!: number;
}
