import {
  PAGINATION_LIMIT_DEFAULT,
  PAGINATION_LIMIT_MAX,
  PAGINATION_LIMIT_MIN,
  PAGINATION_OFFSET_MIN,
} from './constants';
import { OffsetPagination } from './offset-pagination.type';

export function normalizeOffsetPagination(
  pagination: OffsetPagination,
): OffsetPagination {
  let limit = pagination.limit;
  let offset = pagination.offset;

  if (!limit) {
    limit = PAGINATION_LIMIT_DEFAULT;
  } else {
    limit =
      limit < PAGINATION_LIMIT_MIN
        ? 0
        : limit > PAGINATION_LIMIT_MAX
          ? PAGINATION_LIMIT_MAX
          : limit;
  }

  if (!offset || offset < PAGINATION_OFFSET_MIN) {
    offset = 0;
  }

  return { limit, offset };
}
