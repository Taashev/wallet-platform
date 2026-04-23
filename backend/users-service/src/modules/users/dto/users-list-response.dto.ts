import { ApiProperty } from '@nestjs/swagger';

import { ResponseUserDto } from '../../auth/dto/response-user.dto';

export class UsersListResponseDto {
  @ApiProperty({ type: () => [ResponseUserDto] })
  users!: ResponseUserDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}
