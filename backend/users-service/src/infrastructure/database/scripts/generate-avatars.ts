import {
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import 'reflect-metadata';
import sharp from 'sharp';
import { DataSource, EntityManager, In } from 'typeorm';

import {
  ACTIVE_AVATAR_STATUSES,
  AVATAR_BASE_PATH_STORAGE,
  AVATAR_MAX_COUNT_PER_USER,
  AVATAR_STATUSES,
} from '../../../modules/avatars/constants/avatar-constants';
import { AvatarTypeOrmEntity } from '../../../modules/avatars/database/entities/avatar-typeorm.entity';
import { UserTypeOrmEntity } from '../../../modules/users/database/entities/user-typeorm.entity';
import { DatabaseEnv, databaseEnvSchema } from '../../config/database.config';
import { S3Env, s3EnvSchema } from '../../config/s3.config';
import { getDataSourceOptions } from '../data-source';

export const AVATAR_GENERATED_BASE_PATH_STORAGE =
  AVATAR_BASE_PATH_STORAGE + 'generated/';

/*
 * Скрипт использует фиксированный пул из пяти общих файлов.
 *
 * При каждом запуске:
 * 1. Пять WebP-аватаров создаются в памяти и загружаются в S3.
 * 2. Пользователи читаются из PostgreSQL батчами.
 * 3. Каждому пользователю назначается от 1 до 5 разных файлов из общего пула.
 * 4. В таблицу avatars добавляются отдельные записи с уникальными avatarId.
 *
 * В итоге даже для миллионов пользователей в S3 хранится только пять файлов.
 * Разными являются записи в PostgreSQL, а их storageKey переиспользуются.
 *
 * Примеры:
 * npm run avatars:generate          - все пользователи, случайно от 1 до 5;
 * npm run avatars:generate -- 100   - первые 100 пользователей, от 1 до 5;
 * npm run avatars:generate -- 100 3 - первые 100, довести каждого до 3;
 * npm run avatars:generate -- all 3 - всех пользователей довести до 3.
 */

const DEFAULT_MIN_AVATARS_PER_USER = 1;
const DEFAULT_MAX_AVATARS_PER_USER = 5;

// Количество пользователей, обрабатываемых одной DB-транзакцией.
const USERS_BATCH_SIZE = 2_000;

const AVATAR_QUALITY = 82;
const OUTPUT_MIME_TYPE = 'image/webp';

type CliOptions = {
  // null означает обработать всех неудалённых пользователей.
  usersCount: number | null;

  // null означает случайное целевое количество от 1 до 5.
  avatarsPerUser: number | null;
};

type GenerationStats = {
  processedUsers: number;
  skippedUsers: number;
  createdAvatars: number;
};

type AvatarPoolItem = {
  storageKey: string;
  originalName: string;
  svg: string;
  sizeBytes: number;
};

type ExistingAvatarRow = {
  userId: string;
  storageKey: string;
};

type ExistingAvatarState = {
  count: number;
  storageKeys: Set<string>;
};

/*
 * Пять постоянных ключей являются публичным контрактом генератора.
 * Повторный запуск перезаписывает те же объекты, а не создаёт новые файлы.
 */
const AVATAR_POOL: AvatarPoolItem[] = [
  {
    storageKey: `${AVATAR_GENERATED_BASE_PATH_STORAGE}neon-orbit.webp`,
    originalName: 'neon-orbit.webp',
    sizeBytes: 0,
    svg: `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#120458"/>
            <stop offset="1" stop-color="#ff00a8"/>
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="96" fill="url(#bg)"/>
        <circle cx="256" cy="256" r="132" fill="none" stroke="#00f5ff" stroke-width="28"/>
        <circle cx="256" cy="256" r="52" fill="#fff27a"/>
        <circle cx="375" cy="178" r="24" fill="#ffffff"/>
      </svg>
    `,
  },
  {
    storageKey: `${AVATAR_GENERATED_BASE_PATH_STORAGE}sunset-wave.webp`,
    originalName: 'sunset-wave.webp',
    sizeBytes: 0,
    svg: `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#ff4d6d"/>
            <stop offset="0.55" stop-color="#ffb703"/>
            <stop offset="1" stop-color="#023047"/>
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="96" fill="url(#sky)"/>
        <circle cx="256" cy="215" r="92" fill="#fff1a8"/>
        <path d="M0 330 Q128 250 256 330 T512 330 V512 H0Z" fill="#0077b6"/>
        <path d="M0 390 Q128 310 256 390 T512 390 V512 H0Z" fill="#00b4d8"/>
      </svg>
    `,
  },
  {
    storageKey: `${AVATAR_GENERATED_BASE_PATH_STORAGE}cosmic-eye.webp`,
    originalName: 'cosmic-eye.webp',
    sizeBytes: 0,
    svg: `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="space">
            <stop offset="0" stop-color="#3a0ca3"/>
            <stop offset="1" stop-color="#03001c"/>
          </radialGradient>
        </defs>
        <rect width="512" height="512" rx="96" fill="url(#space)"/>
        <circle cx="105" cy="115" r="8" fill="#ffffff"/>
        <circle cx="405" cy="92" r="6" fill="#ffffff"/>
        <circle cx="425" cy="390" r="10" fill="#f72585"/>
        <path d="M70 256 Q256 90 442 256 Q256 422 70 256Z" fill="#4cc9f0"/>
        <circle cx="256" cy="256" r="92" fill="#7209b7"/>
        <circle cx="256" cy="256" r="42" fill="#050505"/>
        <circle cx="278" cy="232" r="14" fill="#ffffff"/>
      </svg>
    `,
  },
  {
    storageKey: `${AVATAR_GENERATED_BASE_PATH_STORAGE}pixel-bolt.webp`,
    originalName: 'pixel-bolt.webp',
    sizeBytes: 0,
    svg: `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="96" fill="#14213d"/>
        <rect x="72" y="72" width="92" height="92" fill="#fca311"/>
        <rect x="348" y="72" width="92" height="92" fill="#e5e5e5"/>
        <rect x="72" y="348" width="92" height="92" fill="#e5e5e5"/>
        <rect x="348" y="348" width="92" height="92" fill="#fca311"/>
        <path d="M285 70 L155 282 H239 L207 442 L357 214 H267Z" fill="#ffd60a"/>
      </svg>
    `,
  },
  {
    storageKey: `${AVATAR_GENERATED_BASE_PATH_STORAGE}mint-monster.webp`,
    originalName: 'mint-monster.webp',
    sizeBytes: 0,
    svg: `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="96" fill="#073b4c"/>
        <path d="M106 290 Q106 120 256 120 Q406 120 406 290 V430 H106Z" fill="#06d6a0"/>
        <circle cx="190" cy="250" r="44" fill="#ffffff"/>
        <circle cx="322" cy="250" r="44" fill="#ffffff"/>
        <circle cx="200" cy="258" r="18" fill="#073b4c"/>
        <circle cx="312" cy="258" r="18" fill="#073b4c"/>
        <path d="M180 342 Q256 410 332 342" fill="none" stroke="#073b4c" stroke-width="24" stroke-linecap="round"/>
        <path d="M145 126 L105 65 L185 104Z" fill="#ef476f"/>
        <path d="M367 126 L407 65 L327 104Z" fill="#ffd166"/>
      </svg>
    `,
  },
];

function parsePositiveInteger(value: string, argumentName: string): number {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${argumentName} должно быть положительным целым числом.`);
  }

  return parsed;
}

/*
 * Первый аргумент задаёт количество пользователей или "all".
 * Второй аргумент задаёт целевое общее количество аватаров пользователя.
 */
function parseCliOptions(args: string[]): CliOptions {
  if (args.length > 2) {
    throw new Error(
      'Использование: npm run avatars:generate -- [usersCount|all] [avatarsPerUser]',
    );
  }

  const usersCountArgument = args[0];
  const avatarsPerUserArgument = args[1];
  const usersCount =
    usersCountArgument === undefined || usersCountArgument === 'all'
      ? null
      : parsePositiveInteger(usersCountArgument, 'Количество пользователей');
  const avatarsPerUser =
    avatarsPerUserArgument === undefined
      ? null
      : parsePositiveInteger(
          avatarsPerUserArgument,
          'Количество аватаров на пользователя',
        );

  if (avatarsPerUser !== null && avatarsPerUser > AVATAR_MAX_COUNT_PER_USER) {
    throw new Error(
      `Количество аватаров не может превышать ${AVATAR_MAX_COUNT_PER_USER}.`,
    );
  }

  return { usersCount, avatarsPerUser };
}

function createDataSource(databaseEnv: DatabaseEnv): DataSource {
  return new DataSource(
    getDataSourceOptions({
      host: databaseEnv.POSTGRES_HOST,
      port: databaseEnv.POSTGRES_PORT,
      name: databaseEnv.POSTGRES_DB,
      username: databaseEnv.POSTGRES_USER,
      password: databaseEnv.POSTGRES_PASSWORD,
    }),
  );
}

function createS3Client(s3Env: S3Env): S3Client {
  return new S3Client({
    endpoint: s3Env.S3_URL,
    region: s3Env.S3_REGION,
    forcePathStyle: s3Env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: s3Env.S3_ACCESS_KEY,
      secretAccessKey: s3Env.S3_SECRET_KEY,
    },
  });
}

function randomInteger(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/*
 * Возвращает целевое ОБЩЕЕ число активных аватаров.
 * Уже существующие записи учитываются, поэтому повторный запуск не создаёт
 * ещё 1-5 записей поверх имеющихся и не превышает лимит пользователя.
 */
function getTargetAvatarCount(
  currentCount: number,
  avatarsPerUser: number | null,
): number {
  if (avatarsPerUser !== null) {
    return Math.max(currentCount, avatarsPerUser);
  }

  if (currentCount >= DEFAULT_MAX_AVATARS_PER_USER) {
    return currentCount;
  }

  return randomInteger(
    Math.max(currentCount, DEFAULT_MIN_AVATARS_PER_USER),
    DEFAULT_MAX_AVATARS_PER_USER,
  );
}

/*
 * Перемешивает копию массива алгоритмом Fisher-Yates.
 * Это позволяет случайно выбрать разные элементы общего пула.
 */
function shuffled<T>(values: T[]): T[] {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index--) {
    const targetIndex = randomInteger(0, index);

    [result[index], result[targetIndex]] = [result[targetIndex], result[index]];
  }

  return result;
}

/*
 * Генерирует и загружает ровно пять общих WebP-файлов.
 * Ключи постоянны, поэтому каждый запуск перезаписывает тот же пул.
 */
async function uploadAvatarPool(
  s3Client: S3Client,
  bucket: string,
): Promise<void> {
  await Promise.all(
    AVATAR_POOL.map(async (avatar) => {
      const image = await sharp(Buffer.from(avatar.svg))
        .webp({ quality: AVATAR_QUALITY })
        .toBuffer();

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: avatar.storageKey,
          Body: image,
          ContentType: OUTPUT_MIME_TYPE,
          Metadata: { generated: 'true', shared: 'true' },
        }),
      );

      avatar.sizeBytes = image.length;
    }),
  );
}

/*
 * Загружает активные storageKey всех пользователей текущего батча.
 * Это нужно одновременно для подсчёта и для исключения повторной ссылки
 * пользователя на один и тот же файл общего пула.
 */
async function getExistingAvatars(
  dataSource: DataSource,
  userIds: string[],
): Promise<Map<string, ExistingAvatarState>> {
  const rows: ExistingAvatarRow[] = await dataSource
    .getRepository(AvatarTypeOrmEntity)
    .createQueryBuilder('avatar')
    .select('avatar.userId', 'userId')
    .addSelect('avatar.storageKey', 'storageKey')
    .where({ userId: In(userIds) })
    .andWhere('avatar.status IN (:...statuses)', {
      statuses: ACTIVE_AVATAR_STATUSES,
    })
    .andWhere('avatar.deletedAt IS NULL')
    .getRawMany();
  const result = new Map<string, ExistingAvatarState>();

  for (const row of rows) {
    const state = result.get(row.userId);

    if (state === undefined) {
      result.set(row.userId, {
        count: 1,
        storageKeys: new Set([row.storageKey]),
      });
    } else {
      state.count++;
      state.storageKeys.add(row.storageKey);
    }
  }

  return result;
}

/*
 * Создаёт новые строки avatars для одного пользовательского батча.
 * У пользователя не повторяются storageKey из фиксированного пула.
 */
function createAvatarEntities(
  users: UserTypeOrmEntity[],
  existingAvatars: Map<string, ExistingAvatarState>,
  avatarsPerUser: number | null,
): { entities: AvatarTypeOrmEntity[]; skippedUsers: number } {
  const entities: AvatarTypeOrmEntity[] = [];
  let skippedUsers = 0;

  for (const user of users) {
    const existingState = existingAvatars.get(user.userId);
    const currentCount = existingState?.count ?? 0;
    const existingStorageKeys = existingState?.storageKeys ?? new Set<string>();
    const targetCount = getTargetAvatarCount(currentCount, avatarsPerUser);
    const avatarsToCreate = targetCount - currentCount;

    if (avatarsToCreate <= 0) {
      skippedUsers++;
      continue;
    }

    const availablePool = shuffled(
      AVATAR_POOL.filter(
        (avatar) => !existingStorageKeys.has(avatar.storageKey),
      ),
    );

    if (availablePool.length < avatarsToCreate) {
      throw new Error(
        `Недостаточно свободных общих аватаров для пользователя ${user.userId}.`,
      );
    }

    for (let index = 0; index < avatarsToCreate; index++) {
      const poolItem = availablePool[index];
      const avatarId = randomUUID();

      entities.push({
        avatarId,
        createdAt: new Date(),
        deletedAt: null,

        // Последняя новая запись становится текущим аватаром пользователя.
        current: index === avatarsToCreate - 1,
        status: AVATAR_STATUSES.ready,
        storageKey: poolItem.storageKey,
        originalName: poolItem.originalName,
        mimeType: OUTPUT_MIME_TYPE,
        sizeBytes: poolItem.sizeBytes,
        userId: user.userId,
        user,
      });
    }
  }

  return { entities, skippedUsers };
}

/*
 * Одной транзакцией снимает current со старых записей и выполняет bulk INSERT.
 */
async function saveAvatars(
  manager: EntityManager,
  entities: AvatarTypeOrmEntity[],
): Promise<void> {
  if (entities.length === 0) {
    return;
  }

  const repository = manager.getRepository(AvatarTypeOrmEntity);
  const userIds = entities
    .filter((avatar) => avatar.current)
    .map((avatar) => avatar.userId);

  await repository
    .createQueryBuilder()
    .update(AvatarTypeOrmEntity)
    .set({ current: false })
    .where('user_id IN (:...userIds)', { userIds })
    .andWhere('current = true')
    .andWhere('deleted_at IS NULL')
    .execute();
  await repository.insert(entities);
}

async function processBatch(
  dataSource: DataSource,
  users: UserTypeOrmEntity[],
  avatarsPerUser: number | null,
  stats: GenerationStats,
): Promise<void> {
  const existingAvatars = await getExistingAvatars(
    dataSource,
    users.map((user) => user.userId),
  );
  const { entities, skippedUsers } = createAvatarEntities(
    users,
    existingAvatars,
    avatarsPerUser,
  );

  await dataSource.transaction((manager) => saveAvatars(manager, entities));

  stats.processedUsers += users.length;
  stats.skippedUsers += skippedUsers;
  stats.createdAvatars += entities.length;

  console.log(
    `Обработано пользователей: ${stats.processedUsers}, создано записей аватаров: ${stats.createdAvatars}`,
  );
}

/*
 * Используется keyset pagination по userId, а не OFFSET.
 * Скорость чтения не деградирует при продвижении к миллионным строкам.
 *
 * В случайном режиме выбираются только пользователи без активных аватаров.
 * Если количество задано явно, выбираются пользователи, у которых активных
 * записей меньше целевого значения. Поэтому повторный запуск `-- 1` перейдёт
 * к следующему ещё не заполненному пользователю.
 */
async function generateAvatarRecords(
  dataSource: DataSource,
  options: CliOptions,
): Promise<GenerationStats> {
  const usersRepository = dataSource.getRepository(UserTypeOrmEntity);
  const stats: GenerationStats = {
    processedUsers: 0,
    skippedUsers: 0,
    createdAvatars: 0,
  };
  let lastUserId: string | null = null;

  while (
    options.usersCount === null ||
    stats.processedUsers < options.usersCount
  ) {
    const remainingUsers =
      options.usersCount === null
        ? USERS_BATCH_SIZE
        : options.usersCount - stats.processedUsers;
    const batchSize = Math.min(USERS_BATCH_SIZE, remainingUsers);
    const queryBuilder = usersRepository
      .createQueryBuilder('users')
      .where('users.deletedAt IS NULL')
      .orderBy('users.userId', 'ASC')
      .take(batchSize);

    if (options.avatarsPerUser === null) {
      queryBuilder.andWhere(
        `
        NOT EXISTS (
          SELECT 1
          FROM avatars AS avatar
          WHERE avatar.user_id = users.user_id
            AND avatar.deleted_at IS NULL
            AND avatar.status IN (:...activeStatuses)
        )
        `,
        { activeStatuses: ACTIVE_AVATAR_STATUSES },
      );
    } else {
      queryBuilder.andWhere(
        `
        (
          SELECT COUNT(*)
          FROM avatars AS avatar
          WHERE avatar.user_id = users.user_id
            AND avatar.deleted_at IS NULL
            AND avatar.status IN (:...activeStatuses)
        ) < :targetAvatarCount
        `,
        {
          activeStatuses: ACTIVE_AVATAR_STATUSES,
          targetAvatarCount: options.avatarsPerUser,
        },
      );
    }

    if (lastUserId !== null) {
      queryBuilder.andWhere('users.userId > :lastUserId', { lastUserId });
    }

    const users = await queryBuilder.getMany();

    if (users.length === 0) {
      break;
    }

    await processBatch(dataSource, users, options.avatarsPerUser, stats);
    lastUserId = users.at(-1)!.userId;
  }

  return stats;
}

async function main(): Promise<void> {
  dotenv.config({ path: ['.env'] });

  const options = parseCliOptions(process.argv.slice(2));
  const databaseEnv = databaseEnvSchema.parse(process.env);
  const s3Env = s3EnvSchema.parse(process.env);
  const dataSource = createDataSource(databaseEnv);
  const s3Client = createS3Client(s3Env);

  try {
    await Promise.all([
      dataSource.initialize(),
      s3Client.send(new HeadBucketCommand({ Bucket: s3Env.S3_BUCKET })),
    ]);

    await uploadAvatarPool(s3Client, s3Env.S3_BUCKET);

    const stats = await generateAvatarRecords(dataSource, options);

    console.log(
      `Готово. Общих файлов в S3: ${AVATAR_POOL.length}, обработано пользователей: ${stats.processedUsers}, создано записей: ${stats.createdAvatars}, пропущено: ${stats.skippedUsers}.`,
    );
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }

    s3Client.destroy();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Не удалось сгенерировать аватары: ${message}`);
  process.exitCode = 1;
});
