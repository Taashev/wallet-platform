import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { SessionsService } from '../../sessions/sessions.service';
import type { UsersRepository } from '../../users/interfaces/repository.interface';
import { USERS_REPOSITORY } from '../../users/users.keys';
import { AuthLocalDto } from '../dto/authLocal.dto';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class SigninUseCase {
  constructor(
    @Inject(USERS_REPOSITORY) private usersRepository: UsersRepository,
    private passwordService: PasswordService,
    private tokensService: TokenService,
    private sessionsService: SessionsService,
  ) {}

  async execute(authLocalDto: AuthLocalDto, userAgent?: string) {
    const { username, password } = authLocalDto;

    const user = await this.usersRepository.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Невалидное имя пользователя или пароль');
    }

    const isValidPassword = await this.passwordService.compare(
      password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Невалидное имя пользователя или пароль');
    }

    const sessionId = this.sessionsService.generateSessionId();

    const { accessToken, refreshToken } = this.tokensService.createAuthTokens({
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
