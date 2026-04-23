import { ValidationError } from '../../../shared/errors';
import {
  About,
  CreateUser,
  DateOfBirth,
  Email,
  Password,
  RestoreUser,
  UpdateUser,
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
  private _username: Username;
  private _email: Email;
  private _password: Password;
  private _about: About;
  private _dateOfBirth: DateOfBirth;

  get username() {
    return this._username;
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  get about() {
    return this._about;
  }

  get dateOfBirth() {
    return this._dateOfBirth;
  }

  private constructor(userProps: UserProps) {
    this.userId = userProps.userId;
    this._username = userProps.username;
    this._email = userProps.email;
    this._password = userProps.password;
    this._dateOfBirth = userProps.dateOfBirth;
    this._about = userProps.about;
  }

  static validateDateOfBirth(value: string) {
    const result = DATE_OF_BIRTH_REGEXP.test(value);

    if (!result) {
      throw new ValidationError({
        message: 'Дата должна быть в формате YYYY-MM-DD',
        safeMessage: 'Дата должна быть в формате YYYY-MM-DD',
        expose: true,
      });
    }

    const [yearString, monthString, dayString] = value.split('-');
    const year = Number(yearString);
    const month = Number(monthString);
    const day = Number(dayString);
    const date = new Date(Date.UTC(year, month - 1, day));

    const isInvalidDate =
      isNaN(date.getTime()) ||
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day;

    if (isInvalidDate) {
      throw new ValidationError({
        message: 'Невалидная дата',
        safeMessage: 'Невалидная дата',
        expose: true,
      });
    }
  }

  static validateUsername(username: Username) {
    if (username.length < USERNAME_MIN_LENGTH) {
      throw new ValidationError({
        message: `Имя пользователя не может быть короче ${USERNAME_MIN_LENGTH} символов`,
        safeMessage: `Имя пользователя не может быть короче ${USERNAME_MIN_LENGTH} символов`,
        expose: true,
      });
    }
  }

  static validateEmail(email: Email) {
    if (!email.includes('@')) {
      throw new ValidationError({
        message: 'Email должен содержать @',
        safeMessage: 'Email должен содержать @',
        expose: true,
      });
    }

    if (email.length < EMAIL_MIN_LENGTH) {
      throw new ValidationError({
        message: `Email не может быть короче ${EMAIL_MIN_LENGTH} символов`,
        safeMessage: `Email не может быть короче ${EMAIL_MIN_LENGTH} символов`,
        expose: true,
      });
    }
  }

  static validatePassword(password: string) {
    if (password.length < PASSWORD_MIN_LENTH) {
      throw new ValidationError({
        message: `Пароль не может быть короче ${PASSWORD_MIN_LENTH} символов`,
        safeMessage: `Пароль не может быть короче ${PASSWORD_MIN_LENTH} символов`,
        expose: true,
      });
    }
  }

  static create(createProps: CreateUser) {
    if (createProps.dateOfBirth !== undefined) {
      this.validateDateOfBirth(createProps.dateOfBirth);
    } else {
      createProps.dateOfBirth = DATE_OF_BIRTH_DEFAULT_VALUE;
    }

    this.validateUsername(createProps.username);
    this.validateEmail(createProps.email);
    this.validatePassword(createProps.password);

    return new User({
      userId: createProps.userId,
      username: createProps.username,
      email: createProps.email,
      password: createProps.password,
      dateOfBirth: createProps.dateOfBirth,
      about: createProps.about?.length
        ? createProps.about
        : ABOUT_DEFAULT_VALUE,
    });
  }

  static restore(restoreProps: RestoreUser) {
    return new User(restoreProps);
  }

  changeProfile(updateProps: UpdateUser) {
    if (updateProps.dateOfBirth !== undefined) {
      User.validateDateOfBirth(updateProps.dateOfBirth);
      this._dateOfBirth = updateProps.dateOfBirth;
    }

    if (updateProps.username !== undefined) {
      User.validateUsername(updateProps.username);
      this._username = updateProps.username;
    }

    if (updateProps.email !== undefined) {
      User.validateEmail(updateProps.email);
      this._email = updateProps.email;
    }

    if (updateProps.about !== undefined) {
      this._about = updateProps.about;
    }
  }

  changePassword(password: Password) {
    User.validatePassword(password);

    this._password = password;
  }

  get age() {
    const currentDate = new Date();
    const dateOfBirth = new Date(this._dateOfBirth);

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
