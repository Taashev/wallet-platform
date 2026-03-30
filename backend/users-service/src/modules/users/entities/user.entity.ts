import {
  About,
  CreateUser,
  DateOfBirth,
  Email,
  Password,
  RestoreUser,
  UserId,
  Username,
} from '../types/user.type';
import {
  ABOUT_DEFAULT_VALUE,
  DATE_OF_BIRTH_DEFAULT_VALUE,
  DATE_OF_BIRTH_REGEXP,
  EMAIL_MIN_LENGTH,
  PASSWORD_MIN_LENTH,
  USERNAME_MIN_LENGTH,
} from '../user.rules';

type UserProps = {
  userId: UserId;
  username: Username;
  email: Email;
  password: Password;
  dateOfBirth: DateOfBirth;
  about: About;
};

export class User {
  readonly userId: UserId;
  readonly username: Username;
  readonly email: Email;
  readonly password: Password;
  readonly about: About;
  readonly dateOfBirth: DateOfBirth;

  private constructor(userProps: UserProps) {
    this.userId = userProps.userId;
    this.username = userProps.username;
    this.email = userProps.email;
    this.password = userProps.password;
    this.dateOfBirth = userProps.dateOfBirth;
    this.about = userProps.about;
  }

  private static validateDateOfBirth(value: string) {
    const result = DATE_OF_BIRTH_REGEXP.test(value);

    if (!result) {
      throw new Error('Дата рождения должна быть в формате YYYY-MM-DD');
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      throw new Error('Невалидная дата');
    }
  }

  static create(createProps: CreateUser) {
    if (createProps.dateOfBirth !== undefined) {
      this.validateDateOfBirth(createProps.dateOfBirth);
    } else {
      createProps.dateOfBirth = DATE_OF_BIRTH_DEFAULT_VALUE;
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
      dateOfBirth: createProps.dateOfBirth,
      about: createProps.about ?? ABOUT_DEFAULT_VALUE,
    });
  }

  static restore(restoreProps: RestoreUser) {
    return new User(restoreProps);
  }

  get age() {
    const currentDate = new Date();
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
