import type {
  About,
  DateOfBirth,
  UserId,
  Username,
} from '../../users/types/user.type';

export type ProfileAvatarRecord = {
  avatarId: string;
  storageKey: string;
};

export type ActiveProfileRecord = {
  userId: UserId;
  username: Username;
  dateOfBirth: DateOfBirth;
  about: About;
  avatar: ProfileAvatarRecord | null;
};

export type ProfileViewAvatar = {
  avatarId: string;
  url: string;
} | null;

export type ProfileView = {
  userId: UserId;
  username: Username;
  about: About;
  age: number;
  avatar: ProfileViewAvatar;
};
