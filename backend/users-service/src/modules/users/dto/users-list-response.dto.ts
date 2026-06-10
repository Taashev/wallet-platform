import { ApiProperty } from '@nestjs/swagger';

import { ProfileResponseDto } from '../../profiles/dto/profile-response.dto';

export class UsersListResponseDto {
  @ApiProperty({ type: () => [ProfileResponseDto] })
  users!: ProfileResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}
