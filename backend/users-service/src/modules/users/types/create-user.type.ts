export type TCreateUser = {
  userId: string;
  username: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  about?: string;
};

export type TRestoreUser = {
  userId: string;
  username: string;
  email: string;
  password: string;
  about: string;
  dateOfBirth: string;
};
