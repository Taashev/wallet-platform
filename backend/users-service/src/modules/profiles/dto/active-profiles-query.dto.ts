import { ApiProperty } from '@nestjs/swagger';

import { Expose, Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

import { OffsetPaginationDto } from '../../../shared/pagination/offset-pagination.dto';

const AGE_MIN = 0;
const AGE_MAX = 150;

export class ActiveProfilesQueryDto extends OffsetPaginationDto {
  @ApiProperty({ minimum: AGE_MIN, maximum: AGE_MAX, example: 18 })
  @Expose()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  minAge!: number;

  @ApiProperty({ minimum: AGE_MIN, maximum: AGE_MAX, example: 35 })
  @Expose()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  maxAge!: number;
}
