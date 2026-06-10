import { ApiProperty } from '@nestjs/swagger';

import { ProfileResponseDto } from './profile-response.dto';

export class ProfileListResponseDto {
  @ApiProperty({ type: () => [ProfileResponseDto] })
  users!: ProfileResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}
