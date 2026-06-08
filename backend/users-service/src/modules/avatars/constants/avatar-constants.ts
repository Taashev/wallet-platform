export const AVATAR_STATUSES = {
  pending: 'pending',
  uploaded: 'uploaded',
  processing: 'processing',
  failed: 'failed',
  rejected: 'rejected',
  ready: 'ready',
} as const;

export const ACTIVE_AVATAR_STATUSES = [
  AVATAR_STATUSES.pending,
  AVATAR_STATUSES.uploaded,
  AVATAR_STATUSES.processing,
  AVATAR_STATUSES.ready,
];

export const AVATAR_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;
export const AVATAR_MIN_SIZE_BYTES = 1;
export const AVATAR_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const AVATAR_MAX_COUNT_PER_USER = 5;

export const AVATAR_BASE_PATH_STORAGE = 'avatars/';
export const AVATAR_BASE_PATH_STORAGE_TMP = 'tmp/avatars/';
