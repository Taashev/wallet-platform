import { ABOUT_DEFAULT_VALUE } from '../user.rules';

type TUsername = string;
type TEmail = string;
type TPassword = string;
type TDateOfBirth = string;
type TAbout = string;

type CreateUserProps = {
  username: TUsername;
  email: TEmail;
  password: TPassword;
  dateOfBirth: TDateOfBirth;
  about?: TAbout;
};

type RestoreUserProps = {
  username: TUsername;
  email: TEmail;
  password: TPassword;
  dateOfBirth: TDateOfBirth;
  about: TAbout;
};

export class User {
  username: TUsername;
  email: TEmail;
  password: TPassword;
  dateOfBirth: TDateOfBirth;
  about: TAbout;

  private constructor(createUserProps: CreateUserProps) {
    this.username = createUserProps.username;
    this.email = createUserProps.email;
    this.password = createUserProps.password;
    this.dateOfBirth = createUserProps.dateOfBirth;
    this.about = createUserProps.about!;
  }

  static create(createProps: CreateUserProps) {
    return new User({
      username: createProps.username,
      email: createProps.email,
      password: createProps.password,
      dateOfBirth: createProps.dateOfBirth,
      about: createProps.about ?? ABOUT_DEFAULT_VALUE,
    });
  }

  static restore(restoreProps: RestoreUserProps) {
    return new User({
      username: restoreProps.username,
      email: restoreProps.email,
      password: restoreProps.password,
      dateOfBirth: restoreProps.dateOfBirth,
      about: restoreProps.about,
    });
  }

  get age() {
    const dateOfBirth = new Date(this.dateOfBirth);
    const currentDate = new Date();

    const year = dateOfBirth.getFullYear();
    const month = dateOfBirth.getMonth() + 1;
    const day = dateOfBirth.getDate();

    return 30;
  }
}
