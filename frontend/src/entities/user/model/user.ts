export type PublicUser = {
  id: string;
  username: string;
  about: string | null;
  dateOfBirth: string | null;
  age: number | null;
};

export type CurrentUserProfile = PublicUser & {
  email: string;
};

export type UsersList = {
  users: PublicUser[];
  total: number;
};
