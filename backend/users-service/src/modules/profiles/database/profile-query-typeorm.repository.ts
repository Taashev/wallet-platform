import { Injectable } from '@nestjs/common';

import { TransactionService } from '../../../infrastructure/transaction/transaction.service';
import { MapPostgresErrorToAppError } from '../../../shared/decorators/map-postgres-error-to-app-error';
import { OffsetPagination } from '../../../shared/pagination/offset-pagination.type';
import { AVATAR_STATUSES } from '../../avatars/constants/avatar-constants';
import {
  About,
  DateOfBirth,
  Email,
  UserId,
  Username,
} from '../../users/types/user.type';
import { ProfileQueryRepository } from '../interfaces/profile-query-repository.interface';
import {
  CurrentProfileRecord,
  ProfileFilter,
  ProfileRecord,
} from '../types/profile.type';

type ProfileRow = {
  user_id: UserId;
  username: Username;
  date_of_birth: DateOfBirth;
  about: About | null;
  avatar_id: string | null;
  storage_key: string | null;
};

type CurrentProfileRow = ProfileRow & {
  email: Email;
};

type ProfilesCountRow = {
  count: number;
};

function mapProfileRow(row: ProfileRow): ProfileRecord {
  return {
    userId: row.user_id,
    username: row.username,
    dateOfBirth: row.date_of_birth,
    about: row.about,
    avatar:
      row.avatar_id !== null && row.storage_key !== null
        ? {
            avatarId: row.avatar_id,
            storageKey: row.storage_key,
          }
        : null,
  };
}

@Injectable()
@MapPostgresErrorToAppError()
export class ProfileQueryTypeOrmRepository implements ProfileQueryRepository {
  constructor(private transactionService: TransactionService) {}

  async getProfileByUserId(
    userId: UserId,
  ): Promise<CurrentProfileRecord | null> {
    const rows = await this.transactionService.manager.query<
      CurrentProfileRow[]
    >(
      `
      SELECT
        u.user_id,
        u.username,
        u.email,
        u.date_of_birth::text AS date_of_birth,
        u.about,
        a.avatar_id,
        a.storage_key
      FROM users AS u
      LEFT JOIN avatars AS a
        ON a.user_id = u.user_id
        AND a.deleted_at IS NULL
        AND a.current = TRUE
        AND a.status = $2
      WHERE u.user_id = $1
        AND u.deleted_at IS NULL
    `,
      [userId, AVATAR_STATUSES.ready],
    );

    const [row] = rows;

    if (row === undefined) {
      return null;
    }

    const profile = mapProfileRow(row);

    return {
      ...profile,
      email: row.email,
    };
  }

  async findProfiles(
    filter: ProfileFilter,
    pagination: OffsetPagination,
  ): Promise<{ profiles: ProfileRecord[]; count: number }> {
    const usernamePattern = filter.username ? `${filter.username}%` : null;
    const manager = this.transactionService.manager;

    const [rows, countRows] = await Promise.all([
      manager.query<ProfileRow[]>(
        `
        SELECT
          u.user_id,
          u.username,
          u.date_of_birth::text AS date_of_birth,
          u.about,
          a.avatar_id,
          a.storage_key
        FROM users AS u
        LEFT JOIN avatars AS a
          ON a.user_id = u.user_id
          AND a.deleted_at IS NULL
          AND a.current = TRUE
          AND a.status = $2
        WHERE u.deleted_at IS NULL
          AND ($1::text IS NULL OR u.username LIKE $1)
        ORDER BY u.user_id ASC
        OFFSET $3
        LIMIT $4
        `,
        [
          usernamePattern,
          AVATAR_STATUSES.ready,
          pagination.offset,
          pagination.limit,
        ],
      ),
      manager.query<ProfilesCountRow[]>(
        `
        SELECT COUNT(*)::int AS count
        FROM users AS u
        WHERE u.deleted_at IS NULL
          AND ($1::text IS NULL OR u.username LIKE $1)
        `,
        [usernamePattern],
      ),
    ]);

    return {
      profiles: rows.map(mapProfileRow),
      count: countRows[0]?.count ?? 0,
    };
  }

  async findActiveProfiles(
    dateOfBirthFrom: DateOfBirth,
    dateOfBirthTo: DateOfBirth,
    pagination: OffsetPagination,
  ): Promise<ProfileRecord[]> {
    const rows = await this.transactionService.manager.query<ProfileRow[]>(
      `
      WITH active_users AS (
        SELECT
          u.user_id,
          u.username,
          u.date_of_birth,
          u.about,
          COUNT(a.avatar_id)::int AS ready_avatar_count
        FROM users AS u
        JOIN avatars AS a
          ON a.user_id = u.user_id
          AND a.deleted_at IS NULL
          AND a.status = $3
        WHERE u.deleted_at IS NULL
          AND NULLIF(TRIM(u.about), '') IS NOT NULL
          AND u.date_of_birth BETWEEN $1::date AND $2::date
        GROUP BY
          u.user_id,
          u.username,
          u.date_of_birth,
          u.about
        HAVING COUNT(a.avatar_id) > 2
        ORDER BY ready_avatar_count DESC, u.user_id ASC
        OFFSET $4
        LIMIT $5
      )
      SELECT
        active_users.user_id,
        active_users.username,
        active_users.date_of_birth::text AS date_of_birth,
        active_users.about,
        current_avatar.avatar_id,
        current_avatar.storage_key
      FROM active_users
      LEFT JOIN avatars AS current_avatar
        ON current_avatar.user_id = active_users.user_id
        AND current_avatar.current = TRUE
        AND current_avatar.status = $3
        AND current_avatar.deleted_at IS NULL
      ORDER BY
        active_users.ready_avatar_count DESC,
        active_users.user_id ASC
      `,
      [
        dateOfBirthFrom,
        dateOfBirthTo,
        AVATAR_STATUSES.ready,
        pagination.offset,
        pagination.limit,
      ],
    );

    return rows.map(mapProfileRow);
  }
}
