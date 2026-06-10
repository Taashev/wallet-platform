import type {
  About,
  DateOfBirth,
  Email,
  UserId,
  Username,
} from '../../users/types/user.type';

export type ProfileAvatarRecord = {
  avatarId: string;
  storageKey: string;
};

export type ProfileRecord = {
  userId: UserId;
  username: Username;
  dateOfBirth: DateOfBirth;
  about: About | null;
  avatar: ProfileAvatarRecord | null;
};

export type CurrentProfileRecord = ProfileRecord & {
  email: Email;
};

export type ProfileViewAvatar = {
  avatarId: string;
  url: string;
} | null;

export type ProfileView = {
  userId: UserId;
  username: Username;
  about: About | null;
  age: number;
  avatar: ProfileViewAvatar;
};

export type CurrentProfileView = ProfileView & {
  email: Email;
  dateOfBirth: DateOfBirth;
};

export type ProfileFilter = {
  username?: Username;
};

export type ProfilesCacheRecord = {
  profiles: ProfileRecord[];
  count: number;
};
