import { Inject, Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '../../../shared/constants/messages.error';
import { UnauthorizedError } from '../../../shared/errors';
import { PasswordService } from '../../security/password.service';
import { TokenService } from '../../security/token.service';
import { SessionsService } from '../../sessions/sessions.service';
import type { UsersRepository } from '../../users/interfaces/repository.interface';
import { USERS_REPOSITORY } from '../../users/users.keys';
import { AuthLocalDto } from '../dto/auth-local.dto';

@Injectable()
export class SigninUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private sessionsService: SessionsService,
  ) {}

  async execute(authLocalDto: AuthLocalDto, userAgent?: string) {
    const { username, password } = authLocalDto;

    const user = await this.usersRepository.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedError({
        message: 'Пользователь с указанным username не найден',
        safeMessage: ERROR_MESSAGES.INVALID_CREDENTIALS,
        expose: true,
      });
    }

    const isValidPassword = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedError({
        message: 'Пароль не прошел проверку при входе',
        safeMessage: ERROR_MESSAGES.INVALID_CREDENTIALS,
        expose: true,
      });
    }

    const sessionId = this.sessionsService.generateSessionId();

    const { accessToken, refreshToken } = this.tokenService.createAuthTokens({
      userId: user.userId,
      sessionId,
    });

    await this.sessionsService.create({
      sessionId,
      refreshToken,
      userId: user.userId,
      userAgent,
    });

    return { accessToken, refreshToken };
  }
}
