// Alias
export type UserId = string;
export type Username = string;
export type Email = string;
export type Password = string;
export type DateOfBirth = string;
export type About = string;

export type CreateUser = {
  userId: UserId;
  username: Username;
  email: Email;
  password: Password;
  dateOfBirth?: DateOfBirth;
  about?: About;
};

export type RestoreUser = Required<CreateUser>;
