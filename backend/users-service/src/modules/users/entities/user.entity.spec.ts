import { ValidationError } from '../../../shared/errors';
import {
  aboutMock,
  dateOfBirthMock,
  emailMock,
  passwordHashMock,
  userIdMock,
  usernameMock,
} from '../../../test/mocks';
import { DATE_OF_BIRTH_DEFAULT_VALUE } from '../constants/user.rules';

import { User } from './user.entity';

describe('User domain entity', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('создает пользователя с дефолтными dateOfBirth', () => {
    const user = User.create({
      userId: userIdMock,
      username: usernameMock,
      email: emailMock,
      password: passwordHashMock,
    });

    expect(user.dateOfBirth).toBe(DATE_OF_BIRTH_DEFAULT_VALUE);
  });

  it('выбрасывает ValidationError, если dateOfBirth передан в невалидном формате', () => {
    expect(() =>
      User.create({
        userId: userIdMock,
        username: usernameMock,
        email: emailMock,
        password: passwordHashMock,
        dateOfBirth: '01-01-2000',
      }),
    ).toThrow(ValidationError);
  });

  it('выбрасывает ValidationError, если дата рождения не существует в календаре', () => {
    expect(() =>
      User.create({
        userId: userIdMock,
        username: usernameMock,
        email: emailMock,
        password: passwordHashMock,
        dateOfBirth: '2023-02-30',
      }),
    ).toThrow(ValidationError);
  });

  it('выбрасывает ValidationError, если username короче минимальной длины', () => {
    expect(() =>
      User.create({
        userId: userIdMock,
        username: 'a',
        email: emailMock,
        password: passwordHashMock,
        dateOfBirth: dateOfBirthMock,
        about: aboutMock,
      }),
    ).toThrow(ValidationError);
  });

  it('выбрасывает ValidationError, если email не содержит @', () => {
    expect(() =>
      User.create({
        userId: userIdMock,
        username: usernameMock,
        email: 'invalid-email',
        password: passwordHashMock,
        dateOfBirth: dateOfBirthMock,
        about: aboutMock,
      }),
    ).toThrow(ValidationError);
  });

  it('выбрасывает ValidationError, если пароль короче минимальной длины', () => {
    expect(() =>
      User.create({
        userId: userIdMock,
        username: usernameMock,
        email: emailMock,
        password: '12',
        dateOfBirth: dateOfBirthMock,
        about: aboutMock,
      }),
    ).toThrow(ValidationError);
  });

  it('changeProfile обновляет только переданные поля', () => {
    const user = User.create({
      userId: userIdMock,
      username: usernameMock,
      email: emailMock,
      password: passwordHashMock,
      dateOfBirth: dateOfBirthMock,
      about: aboutMock,
    });

    user.changeProfile({
      username: 'new-username',
      about: 'new about',
    });

    expect(user.username).toBe('new-username');
    expect(user.about).toBe('new about');
    expect(user.email).toBe(emailMock);
    expect(user.dateOfBirth).toBe(dateOfBirthMock);
  });

  it('changePassword обновляет пароль пользователя', () => {
    const user = User.create({
      userId: userIdMock,
      username: usernameMock,
      email: emailMock,
      password: passwordHashMock,
      dateOfBirth: dateOfBirthMock,
      about: aboutMock,
    });

    user.changePassword('NewPasswordHash');

    expect(user.password).toBe('NewPasswordHash');
  });

  it('age корректно считается, если день рождения в этом году еще не наступил', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-18T12:00:00.000Z'));

    const user = User.create({
      userId: userIdMock,
      username: usernameMock,
      email: emailMock,
      password: passwordHashMock,
      dateOfBirth: '2000-04-19',
      about: aboutMock,
    });

    expect(user.age).toBe(25);
  });
});
