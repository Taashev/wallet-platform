import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_STATUSES,
} from '../constants/avatar-constants';

export type AvatarStatus =
  (typeof AVATAR_STATUSES)[keyof typeof AVATAR_STATUSES];

export type AvatarMimeType = (typeof AVATAR_ALLOWED_MIME_TYPES)[number];

export type UpdateAvatarData = {
  mimeType?: string;
  sizeBytes?: number;
  storageKey?: string;
  status?: AvatarStatus;
  current?: boolean;
};

export type CriteriaUpdateAvatar = {
  avatarId?: string;
  userId?: string;
  currentStatus?: AvatarStatus;
  current?: boolean;
};

export type CreateAvatar = {
  avatarId: string;
  storageKey: string;
  originalName: string;
  current?: boolean;
  status?: AvatarStatus;
  mimeType?: string | null;
  sizeBytes?: number | null;
  userId: string;
};

export type RestoreAvatar = Required<CreateAvatar>;

export type ProcessAvatarPayload = {
  avatarId: string;
  userId: string;
};

export type GetAvatarByIdOptions = { status?: AvatarStatus; userId?: string };
