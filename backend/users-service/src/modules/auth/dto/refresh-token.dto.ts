import { ApiProperty } from '@nestjs/swagger';

import { Expose } from 'class-transformer';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh токен',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.payload.signature',
  })
  @Expose()
  @IsJWT()
  refreshToken!: string;
}
