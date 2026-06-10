import { ApiProperty } from '@nestjs/swagger';

import { Exclude, Expose, Type } from 'class-transformer';

import type {
  About,
  Email,
  UserId,
  Username,
} from '../../users/types/user.type';

export class ProfileAvatarResponseDto {
  @ApiProperty({ example: 'e7e91b88-724f-4ec1-a370-847f65057cad' })
  @Expose()
  avatarId!: string;

  @ApiProperty({
    example: 'https://storage.example.com/avatars/avatar-id?signature=...',
  })
  @Expose()
  url!: string;
}

export class ProfileResponseDto {
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

  @ApiProperty({ example: 'Backend engineer', nullable: true })
  @Expose({ groups: ['public', 'private'] })
  about!: About | null;

  @ApiProperty({ example: '1999-12-31' })
  @Expose({ groups: ['private'] })
  dateOfBirth!: string;

  @ApiProperty({ example: 26 })
  @Expose({ groups: ['public', 'private'] })
  age!: number;

  @ApiProperty({
    type: () => ProfileAvatarResponseDto,
    nullable: true,
  })
  @Expose({ groups: ['public', 'private'] })
  @Type(() => ProfileAvatarResponseDto)
  avatar!: ProfileAvatarResponseDto | null;
}
