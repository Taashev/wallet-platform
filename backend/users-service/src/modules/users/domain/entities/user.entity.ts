import {
  ABOUT_DEFAULT_VALUE,
  DATE_OF_BIRTH_REGEXP,
  EMAIL_MIN_LENGTH,
  PASSWORD_MIN_LENTH,
  USERNAME_MIN_LENGTH,
} from '../user.rules';

type TUserId = string;
type TUsername = string;
type TEmail = string;
type TPassword = string;
type TDateOfBirth = string;
type TAbout = string;

type UserProps = {
  userId: TUserId;
  username: TUsername;
  email: TEmail;
  password: TPassword;
  dateOfBirth: TDateOfBirth | null;
  about: TAbout;
};

type CreateUserProps = {
  userId: TUserId;
  username: TUsername;
  email: TEmail;
  password: TPassword;
  dateOfBirth?: TDateOfBirth;
  about?: TAbout;
};

type RestoreUserProps = {
  userId: TUserId;
  username: TUsername;
  email: TEmail;
  password: TPassword;
  dateOfBirth: TDateOfBirth | null;
  about: TAbout;
};

export class User {
  readonly userId: TUserId;
  readonly username: TUsername;
  readonly email: TEmail;
  readonly password: TPassword;
  readonly dateOfBirth: TDateOfBirth | null;
  readonly about: TAbout;

  private constructor(userProps: UserProps) {
    this.userId = userProps.userId;
    this.username = userProps.username;
    this.email = userProps.email;
    this.password = userProps.password;
    this.dateOfBirth = userProps.dateOfBirth;
    this.about = userProps.about;
  }

  private static validateDateOfBirth(value: TDateOfBirth) {
    const result = DATE_OF_BIRTH_REGEXP.test(value);

    if (!result) {
      throw new Error('Дата рождения должна быть в формате YYYY-MM-DD');
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new Error('Невалидная дата');
    }
  }

  static create(createProps: CreateUserProps) {
    if (createProps.dateOfBirth !== undefined) {
      this.validateDateOfBirth(createProps.dateOfBirth);
    }

    if (createProps.username.length < USERNAME_MIN_LENGTH) {
      throw new Error(
        `Имя пользователя не может быть короче ${USERNAME_MIN_LENGTH} символов`,
      );
    }

    if (!createProps.email.includes('@')) {
      throw new Error('Email должен содержать @');
    }

    if (createProps.email.length < EMAIL_MIN_LENGTH) {
      throw new Error(
        `Email не может быть короче ${EMAIL_MIN_LENGTH} символов`,
      );
    }

    if (createProps.password.length < PASSWORD_MIN_LENTH) {
      throw new Error(
        `Пароль не может быть короче ${PASSWORD_MIN_LENTH} символов`,
      );
    }

    return new User({
      userId: createProps.userId,
      username: createProps.username,
      email: createProps.email,
      password: createProps.password,
      dateOfBirth: createProps.dateOfBirth ?? null,
      about: createProps.about ?? ABOUT_DEFAULT_VALUE,
    });
  }

  static restore(restoreProps: RestoreUserProps) {
    return new User(restoreProps);
  }

  getAge(currentDate: Date) {
    if (this.dateOfBirth === null) {
      return null;
    }

    const dateOfBirth = new Date(this.dateOfBirth);

    let age = currentDate.getFullYear() - dateOfBirth.getFullYear();

    const hasHadBirthdayThisYear =
      currentDate.getMonth() > dateOfBirth.getMonth() ||
      (currentDate.getMonth() === dateOfBirth.getMonth() &&
        currentDate.getDate() >= dateOfBirth.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  }
}
