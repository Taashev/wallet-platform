import { ApiPropertyOptional } from '@nestjs/swagger';

import { Expose, Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_LIMIT_MAX,
  PAGINATION_LIMIT_MIN,
  PAGINATION_OFFSET_MIN,
} from './constants';

export class OffsetPaginationDto {
  @ApiPropertyOptional({
    minimum: PAGINATION_OFFSET_MIN,
    default: PAGINATION_OFFSET_MIN,
    example: 0,
  })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(PAGINATION_OFFSET_MIN)
  offset: number = PAGINATION_OFFSET_MIN;

  @ApiPropertyOptional({
    minimum: PAGINATION_LIMIT_MIN,
    maximum: PAGINATION_LIMIT_MAX,
    default: PAGINATION_LIMIT_DEFAULT,
    example: PAGINATION_LIMIT_DEFAULT,
  })
  @Expose()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(PAGINATION_LIMIT_MIN)
  @Max(PAGINATION_LIMIT_MAX)
  limit: number = PAGINATION_LIMIT_DEFAULT;
}
